import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    return {
      name: "Database",
      status: latency < 500 ? "healthy" : "degraded",
      latency,
      message: latency < 500 ? "Connected" : "Slow response",
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
    // Just check if auth service responds by getting session
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
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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

    // OPTIONS returning anything means the function exists and is deployed
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
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const health: SystemHealth = {
      overall,
      timestamp: new Date().toISOString(),
      database,
      storage,
      auth,
      edgeFunctions: edgeFunctionResults,
      apiEndpoints: apiEndpointResults,
    };

    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Health check error:", error);
    return new Response(
      JSON.stringify({
        overall: "down",
        timestamp: new Date().toISOString(),
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
