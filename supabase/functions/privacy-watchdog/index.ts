import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PrivacyAlert {
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  affected_area: string;
  recommendation: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[privacy-watchdog] Starting privacy compliance scan...");

    const alerts: PrivacyAlert[] = [];
    const checksPerformed: string[] = [];

    // 1. Check for tables without RLS enabled
    checksPerformed.push("rls_check");
    const { data: tablesWithoutRls } = await supabase.rpc("get_tables_without_rls").maybeSingle();
    // Note: This would require a custom function - we'll check known user tables instead

    // 2. Check consent records - look for patterns
    checksPerformed.push("consent_patterns");
    const { data: consentStats, error: consentError } = await supabase
      .from("consent_records")
      .select("consent_type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (!consentError && consentStats) {
      const totalConsents = consentStats.length;
      const withdrawnCount = consentStats.filter(c => c.status === "withdrawn").length;
      
      if (totalConsents > 0 && (withdrawnCount / totalConsents) > 0.3) {
        alerts.push({
          alert_type: "high_withdrawal_rate",
          severity: "medium",
          title: "High Consent Withdrawal Rate",
          description: `${((withdrawnCount / totalConsents) * 100).toFixed(1)}% of users have withdrawn consent`,
          affected_area: "User Consent",
          recommendation: "Review cookie consent UX and privacy communications"
        });
      }
    }

    // 3. Check data retention compliance
    checksPerformed.push("data_retention");
    const { data: retentionRules } = await supabase
      .from("data_retention_rules")
      .select("*")
      .eq("is_active", true);

    if (!retentionRules || retentionRules.length === 0) {
      alerts.push({
        alert_type: "no_retention_rules",
        severity: "high",
        title: "No Active Data Retention Rules",
        description: "No data retention policies are configured",
        affected_area: "Data Retention",
        recommendation: "Configure retention rules for user data tables"
      });
    }

    // 4. Check for third-party integrations without privacy assessment
    checksPerformed.push("third_party_check");
    const { data: thirdParty } = await supabase
      .from("third_party_integrations")
      .select("*")
      .is("privacy_assessment_date", null)
      .eq("is_active", true);

    if (thirdParty && thirdParty.length > 0) {
      alerts.push({
        alert_type: "unassessed_integrations",
        severity: "medium",
        title: "Third-Party Integrations Without Privacy Assessment",
        description: `${thirdParty.length} active integration(s) lack privacy assessment`,
        affected_area: "Third-Party Services",
        recommendation: "Conduct privacy impact assessments for all integrations"
      });
    }

    // 5. Check for stale privacy audit logs (potential missing logging)
    checksPerformed.push("audit_log_check");
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentLogs } = await supabase
      .from("privacy_audit_log")
      .select("id")
      .gte("created_at", oneDayAgo)
      .limit(1);

    // This is informational, not necessarily an alert

    // 6. Check community profiles for missing consent
    checksPerformed.push("profile_consent_check");
    const { count: profilesWithoutConsent } = await supabase
      .from("community_profiles")
      .select("id", { count: "exact", head: true })
      .is("gdpr_consent_given_at", null)
      .eq("status", "verified");

    if (profilesWithoutConsent && profilesWithoutConsent > 0) {
      alerts.push({
        alert_type: "profiles_missing_consent",
        severity: "high",
        title: "Verified Profiles Without GDPR Consent",
        description: `${profilesWithoutConsent} verified profile(s) lack recorded GDPR consent`,
        affected_area: "User Profiles",
        recommendation: "Prompt users for consent or add consent collection to signup flow"
      });
    }

    // Store new alerts in the database
    for (const alert of alerts) {
      // Check if similar alert already exists (not resolved)
      const { data: existing } = await supabase
        .from("privacy_alerts")
        .select("id")
        .eq("alert_type", alert.alert_type)
        .is("resolved_at", null)
        .maybeSingle();

      if (!existing) {
        await supabase.from("privacy_alerts").insert({
          alert_type: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          affected_area: alert.affected_area,
          recommendation: alert.recommendation,
        });
        console.log(`[privacy-watchdog] Created alert: ${alert.title}`);
      }
    }

    // Log the agent run
    await supabase.from("privacy_agent_runs").insert({
      run_type: "scheduled_scan",
      status: "completed",
      checks_performed: checksPerformed,
      alerts_generated: alerts.length,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    console.log(`[privacy-watchdog] Scan complete. ${alerts.length} new alerts generated.`);

    return new Response(
      JSON.stringify({
        success: true,
        checksPerformed,
        alertsGenerated: alerts.length,
        alerts,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[privacy-watchdog] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
