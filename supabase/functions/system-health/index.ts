import { Resend } from "https://esm.sh/resend@2.0.0";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, createAnonClient, getRequiredEnv, getEnv } from "../_shared/supabase.ts";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  latency?: number;
  message?: string;
  lastChecked: string;
}

interface SystemHealth {
  overall: "healthy" | "degraded" | "down";
  timestamp: string;
  database: HealthCheck;
  storage: HealthCheck;
  auth: HealthCheck;
  edgeFunctions: HealthCheck[];
  apiEndpoints: HealthCheck[];
}

const EDGE_FUNCTIONS = [
  "api-v1-ping",
  "rag-chat",
  "news-agent",
  "media-engine",
  "ai-orchestration",
  "content-sync",
  "youtube-search",
];

const API_ENDPOINTS = [
  { name: "Search API", path: "/api-v1-search" },
  { name: "Docs API", path: "/api-v1-docs" },
  { name: "Chunks API", path: "/api-v1-chunks" },
];

// Notification cooldown: don't re-notify for same issue within 30 minutes
const NOTIFICATION_COOLDOWN_MS = 30 * 60 * 1000;

async function checkDatabase(supabase: any): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("id")
      .limit(1);

    const latency = Date.now() - start;

    if (error) {
      return {
        name: "Database",
        status: "down",
        latency,
        message: error.message,
        lastChecked: new Date().toISOString(),
      };
    }

    // Increased threshold to 2000ms to reduce false positives
    return {
      name: "Database",
      status: latency < 2000 ? "healthy" : "degraded",
      latency,
      message: latency < 2000 ? "Connected" : "Slow response",
      lastChecked: new Date().toISOString(),
    };
  } catch (e: unknown) {
    const error = e as Error;
    return {
      name: "Database",
      status: "down",
      latency: Date.now() - start,
      message: error.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkStorage(supabase: any): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.storage.listBuckets();
    const latency = Date.now() - start;

    if (error) {
      return {
        name: "Storage",
        status: "down",
        latency,
        message: error.message,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      name: "Storage",
      status: "healthy",
      latency,
      message: `${data?.length || 0} buckets available`,
      lastChecked: new Date().toISOString(),
    };
  } catch (e: unknown) {
    const error = e as Error;
    return {
      name: "Storage",
      status: "down",
      latency: Date.now() - start,
      message: error.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkAuth(supabase: any): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const { error } = await supabase.auth.getSession();
    const latency = Date.now() - start;

    if (error && !error.message.includes("no session")) {
      return {
        name: "Auth Service",
        status: "down",
        latency,
        message: error.message,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      name: "Auth Service",
      status: "healthy",
      latency,
      message: "Auth service responding",
      lastChecked: new Date().toISOString(),
    };
  } catch (e: unknown) {
    const error = e as Error;
    return {
      name: "Auth Service",
      status: "down",
      latency: Date.now() - start,
      message: error.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkEdgeFunction(
  functionName: string,
  supabaseUrl: string,
  anonKey: string
): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    // Increased timeout to 15s to account for cold starts
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `${supabaseUrl}/functions/v1/${functionName}`,
      {
        method: "OPTIONS",
        headers: {
          Authorization: `Bearer ${anonKey}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    return {
      name: functionName,
      status: "healthy",
      latency,
      message: "Function deployed",
      lastChecked: new Date().toISOString(),
    };
  } catch (e: unknown) {
    const error = e as Error;
    const latency = Date.now() - start;
    if (error.name === "AbortError") {
      return {
        name: functionName,
        status: "degraded",
        latency,
        message: "Timeout",
        lastChecked: new Date().toISOString(),
      };
    }
    return {
      name: functionName,
      status: "unknown",
      latency,
      message: error.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkApiEndpoint(
  endpoint: { name: string; path: string },
  supabaseUrl: string,
  anonKey: string
): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    // Increased timeout to 15s to account for cold starts
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `${supabaseUrl}/functions/v1${endpoint.path}`,
      {
        method: "OPTIONS",
        headers: {
          Authorization: `Bearer ${anonKey}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    return {
      name: endpoint.name,
      status: "healthy",
      latency,
      message: "Endpoint available",
      lastChecked: new Date().toISOString(),
    };
  } catch (e: unknown) {
    const error = e as Error;
    const latency = Date.now() - start;
    return {
      name: endpoint.name,
      status: error.name === "AbortError" ? "degraded" : "unknown",
      latency,
      message: error.name === "AbortError" ? "Timeout" : error.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function shouldNotify(
  supabase: any,
  serviceName: string
): Promise<boolean> {
  // Check if there's a recent unresolved alert for this service
  const { data: existingAlert } = await supabase
    .from("health_alerts")
    .select("id, notified_at")
    .eq("service_name", serviceName)
    .is("resolved_at", null)
    .order("notified_at", { ascending: false })
    .limit(1)
    .single();

  if (!existingAlert) return true;

  // Check if cooldown has passed
  const lastNotified = new Date(existingAlert.notified_at).getTime();
  return Date.now() - lastNotified > NOTIFICATION_COOLDOWN_MS;
}

async function sendEmailNotification(
  issues: HealthCheck[],
  overall: string
): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured, skipping email notification");
    return;
  }

  const resend = new Resend(resendApiKey);
  
  const issueList = issues
    .map((i) => `• ${i.name}: ${i.status.toUpperCase()} - ${i.message || "No details"}`)
    .join("\n");

  const severity = overall === "down" ? "🚨 CRITICAL" : "⚠️ WARNING";
  
  try {
    await resend.emails.send({
      from: "ringleader@techno.dog <alex@rmtb.io>",
      reply_to: "alex@rmtb.io",
      to: ["alex@rmtb.io"],
      subject: `${severity} System Health Alert - techno.dog`,
      html: `
        <div style="font-family: monospace; padding: 20px; background: #1a1a1a; color: #fff;">
          <h1 style="color: ${overall === "down" ? "#ef4444" : "#eab308"};">
            ${severity} System Health Alert
          </h1>
          <p style="color: #888;">Detected at: ${new Date().toISOString()}</p>
          <h2 style="color: #22c55e;">Affected Services:</h2>
          <pre style="background: #2a2a2a; padding: 15px; border-radius: 4px; color: #f0f0f0;">
${issueList}
          </pre>
          <p style="margin-top: 20px;">
            <a href="https://techno.dog/admin/health" style="color: #22c55e;">
              View System Health Dashboard →
            </a>
          </p>
        </div>
      `,
    });
    console.log("Email notification sent successfully");
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}

async function sendWebhookNotifications(
  supabase: any,
  issues: HealthCheck[],
  overall: string
): Promise<void> {
  // Get all active webhooks subscribed to health events
  const { data: webhooks } = await supabase
    .from("webhooks")
    .select("*")
    .eq("status", "active")
    .contains("events", ["health.alert"]);

  if (!webhooks || webhooks.length === 0) {
    console.log("No webhooks subscribed to health.alert events");
    return;
  }

  const payload = {
    event: "health.alert",
    timestamp: new Date().toISOString(),
    overall_status: overall,
    issues: issues.map((i) => ({
      name: i.name,
      status: i.status,
      message: i.message,
      latency: i.latency,
    })),
  };

  for (const webhook of webhooks) {
    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": webhook.secret,
          "X-Event-Type": "health.alert",
        },
        body: JSON.stringify(payload),
      });

      // Log delivery
      await supabase.from("webhook_deliveries").insert({
        webhook_id: webhook.id,
        event_type: "health.alert",
        payload,
        response_status: response.status,
        success: response.ok,
      });

      console.log(`Webhook ${webhook.name} notified: ${response.status}`);
    } catch (error) {
      console.error(`Failed to notify webhook ${webhook.name}:`, error);
      await supabase.from("webhook_deliveries").insert({
        webhook_id: webhook.id,
        event_type: "health.alert",
        payload,
        response_status: 0,
        success: false,
        response_body: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

async function createHealthAlert(
  supabase: any,
  check: HealthCheck,
  severity: "critical" | "warning"
): Promise<void> {
  await supabase.from("health_alerts").insert({
    alert_type: "service_degradation",
    severity,
    service_name: check.name,
    message: `${check.name} is ${check.status}: ${check.message || "No details"}`,
  });
}

async function resolveHealthAlerts(
  supabase: any,
  serviceName: string
): Promise<void> {
  await supabase
    .from("health_alerts")
    .update({ resolved_at: new Date().toISOString() })
    .eq("service_name", serviceName)
    .is("resolved_at", null);
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const anonKey = getRequiredEnv("SUPABASE_ANON_KEY");

    const supabase = createServiceClient();

    // Check if notifications should be sent (query param)
    const url = new URL(req.url);
    const sendNotifications = url.searchParams.get("notify") === "true";

    // Run all health checks in parallel
    const [database, storage, auth, ...edgeFunctionResults] = await Promise.all([
      checkDatabase(supabase),
      checkStorage(supabase),
      checkAuth(supabase),
      ...EDGE_FUNCTIONS.map((fn) => checkEdgeFunction(fn, supabaseUrl, anonKey)),
    ]);

    // Check API endpoints
    const apiEndpointResults = await Promise.all(
      API_ENDPOINTS.map((ep) => checkApiEndpoint(ep, supabaseUrl, anonKey))
    );

    // Determine overall health
    const allChecks = [database, storage, auth, ...edgeFunctionResults, ...apiEndpointResults];
    const hasDown = allChecks.some((c) => c.status === "down");
    const hasDegraded = allChecks.some((c) => c.status === "degraded");

    const overall = hasDown ? "down" : hasDegraded ? "degraded" : "healthy";

    // Handle notifications for critical issues
    if (sendNotifications && (hasDown || hasDegraded)) {
      const criticalIssues = allChecks.filter((c) => c.status === "down");
      const warningIssues = allChecks.filter((c) => c.status === "degraded");
      const allIssues = [...criticalIssues, ...warningIssues];

      // Check which services need notification
      const issuesToNotify: HealthCheck[] = [];
      for (const issue of allIssues) {
        if (await shouldNotify(supabase, issue.name)) {
          issuesToNotify.push(issue);
          const severity = issue.status === "down" ? "critical" : "warning";
          await createHealthAlert(supabase, issue, severity);
        }
      }

      // Send notifications if there are new issues
      if (issuesToNotify.length > 0) {
        console.log(`Sending notifications for ${issuesToNotify.length} issues`);
        
        // Send email and webhook notifications in background
        EdgeRuntime.waitUntil(
          Promise.all([
            sendEmailNotification(issuesToNotify, overall),
            sendWebhookNotifications(supabase, issuesToNotify, overall),
          ])
        );
      }

      // Resolve alerts for healthy services
      const healthyServices = allChecks.filter((c) => c.status === "healthy");
      for (const service of healthyServices) {
        await resolveHealthAlerts(supabase, service.name);
      }
    }

    const health: SystemHealth = {
      overall,
      timestamp: new Date().toISOString(),
      database,
      storage,
      auth,
      edgeFunctions: edgeFunctionResults,
      apiEndpoints: apiEndpointResults,
    };

    return jsonResponse(health);
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Health check error:", error);
    return jsonResponse({
      overall: "down",
      timestamp: new Date().toISOString(),
      error: error.message,
    }, 500);
  }
});
