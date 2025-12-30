import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationChannel {
  id: string;
  name: string;
  channel_type: 'discord' | 'slack' | 'email' | 'webhook';
  webhook_url: string | null;
  email_addresses: string[] | null;
  is_active: boolean;
  notify_on_severity: string[];
  notify_categories: string[];
  cooldown_minutes: number;
  last_notified_at: string | null;
}

interface AlertPayload {
  severity: string;
  category: string;
  title: string;
  message: string;
  source?: string;
  agent_report_id?: string;
  health_alert_id?: string;
}

async function sendDiscordNotification(
  webhookUrl: string,
  alert: AlertPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const severityColors: Record<string, number> = {
    critical: 0xFF0000, // Red
    error: 0xFF6B6B,    // Light red
    warning: 0xFFAA00,  // Orange
    info: 0x00AA00,     // Green
  };

  const embed = {
    title: `🚨 ${alert.title}`,
    description: alert.message,
    color: severityColors[alert.severity] || 0x808080,
    fields: [
      { name: "Severity", value: alert.severity.toUpperCase(), inline: true },
      { name: "Category", value: alert.category, inline: true },
      { name: "Source", value: alert.source || "System", inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "TECHNO.DOG Alert System" },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    return {
      success: response.ok,
      statusCode: response.status,
      error: response.ok ? undefined : await response.text(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function sendSlackNotification(
  webhookUrl: string,
  alert: AlertPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const severityLabels: Record<string, string> = {
    critical: "[CRITICAL]",
    error: "[ERROR]",
    warning: "[WARNING]",
    info: "[INFO]",
  };

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${severityLabels[alert.severity] || "[ALERT]"} ${alert.title}`,
        emoji: false,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: alert.message,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*Severity:* ${alert.severity.toUpperCase()} | *Category:* ${alert.category} | *Source:* ${alert.source || "System"}`,
        },
      ],
    },
    { type: "divider" },
  ];

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });

    return {
      success: response.ok,
      statusCode: response.status,
      error: response.ok ? undefined : await response.text(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function sendGenericWebhook(
  webhookUrl: string,
  alert: AlertPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...alert,
        timestamp: new Date().toISOString(),
        source: "TECHNO.DOG",
      }),
    });

    return {
      success: response.ok,
      statusCode: response.status,
      error: response.ok ? undefined : await response.text(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { action, alert } = body;

    if (action === "dispatch" && alert) {
      const payload = alert as AlertPayload;
      console.log(`Alert Dispatcher: Processing ${payload.severity} alert: ${payload.title}`);

      // Fetch active notification channels
      const { data: channels, error: channelsError } = await supabase
        .from("notification_channels")
        .select("*")
        .eq("is_active", true);

      if (channelsError) {
        throw new Error(`Failed to fetch channels: ${channelsError.message}`);
      }

      const results: Array<{
        channel: string;
        type: string;
        success: boolean;
        error?: string;
      }> = [];

      for (const channel of (channels || []) as NotificationChannel[]) {
        // Check severity filter
        if (!channel.notify_on_severity.includes(payload.severity)) {
          continue;
        }

        // Check category filter
        if (!channel.notify_categories.includes(payload.category) && 
            !channel.notify_categories.includes("*")) {
          continue;
        }

        // Check cooldown
        if (channel.last_notified_at) {
          const lastNotified = new Date(channel.last_notified_at);
          const cooldownMs = channel.cooldown_minutes * 60 * 1000;
          if (Date.now() - lastNotified.getTime() < cooldownMs) {
            console.log(`Channel ${channel.name} is in cooldown`);
            continue;
          }
        }

        let result: { success: boolean; statusCode?: number; error?: string };

        // Send based on channel type
        switch (channel.channel_type) {
          case "discord":
            if (channel.webhook_url) {
              result = await sendDiscordNotification(channel.webhook_url, payload);
            } else {
              result = { success: false, error: "No webhook URL configured" };
            }
            break;
          case "slack":
            if (channel.webhook_url) {
              result = await sendSlackNotification(channel.webhook_url, payload);
            } else {
              result = { success: false, error: "No webhook URL configured" };
            }
            break;
          case "webhook":
            if (channel.webhook_url) {
              result = await sendGenericWebhook(channel.webhook_url, payload);
            } else {
              result = { success: false, error: "No webhook URL configured" };
            }
            break;
          default:
            result = { success: false, error: `Unsupported channel type: ${channel.channel_type}` };
        }

        results.push({
          channel: channel.name,
          type: channel.channel_type,
          success: result.success,
          error: result.error,
        });

        // Log the notification
        await supabase.from("notification_logs").insert({
          channel_id: channel.id,
          agent_report_id: payload.agent_report_id || null,
          health_alert_id: payload.health_alert_id || null,
          notification_type: channel.channel_type,
          severity: payload.severity,
          title: payload.title,
          message: payload.message,
          delivery_status: result.success ? "sent" : "failed",
          response_code: result.statusCode || null,
          error_message: result.error || null,
        });

        // Update last_notified_at
        if (result.success) {
          await supabase
            .from("notification_channels")
            .update({ last_notified_at: new Date().toISOString() })
            .eq("id", channel.id);
        }
      }

      console.log(`Alert Dispatcher: Sent to ${results.filter(r => r.success).length}/${results.length} channels`);

      return new Response(JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "test-channel") {
      const { channelId } = body;
      
      const { data: channel, error } = await supabase
        .from("notification_channels")
        .select("*")
        .eq("id", channelId)
        .single();

      if (error || !channel) {
        return new Response(JSON.stringify({
          success: false,
          error: "Channel not found",
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const testAlert: AlertPayload = {
        severity: "info",
        category: "operations",
        title: "🧪 Test Alert from TECHNO.DOG",
        message: "This is a test notification to verify your channel configuration is working correctly.",
        source: "Alert Dispatcher Test",
      };

      let result;
      switch (channel.channel_type) {
        case "discord":
          result = await sendDiscordNotification(channel.webhook_url, testAlert);
          break;
        case "slack":
          result = await sendSlackNotification(channel.webhook_url, testAlert);
          break;
        case "webhook":
          result = await sendGenericWebhook(channel.webhook_url, testAlert);
          break;
        default:
          result = { success: false, error: "Unsupported channel type" };
      }

      return new Response(JSON.stringify({
        success: result.success,
        channel: channel.name,
        error: result.error,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: "Invalid action. Use 'dispatch' or 'test-channel'",
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Alert Dispatcher error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
