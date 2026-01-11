import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

interface PrivacyManifest {
  version: string;
  lastUpdated: string;
  organization: {
    name: string;
    legalName: string;
    address: string;
    country: string;
    cif: string;
    dpo: {
      name: string;
      email: string;
    };
  };
  compliance: {
    gdpr: boolean;
    ccpa: boolean;
    cpra: boolean;
    ePrivacy: boolean;
    gpc: boolean;
  };
  dataCollection: {
    categories: Array<{
      name: string;
      collected: boolean;
      purpose: string;
      retention: string;
      sold: boolean;
      shared: boolean;
    }>;
  };
  cookies: {
    categories: Array<{
      name: string;
      required: boolean;
      purpose: string;
      cookies: string[];
    }>;
  };
  rights: {
    gdpr: string[];
    ccpa: string[];
  };
  thirdParties: Array<{
    name: string;
    purpose: string;
    dpaStatus: string;
    location: string;
    transferMechanism: string;
  }>;
  endpoints: {
    privacyPolicy: string;
    cookiePolicy: string;
    termsOfService: string;
    gdprRequest: string;
    ccpaRequest: string;
    doNotSell: string;
    consentSettings: string;
  };
  signals: {
    gpcHonored: boolean;
    dntHonored: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const manifest: PrivacyManifest = {
    version: "1.0.0",
    lastUpdated: "2025-01-11T00:00:00Z",
    organization: {
      name: "techno.dog",
      legalName: "Miramonte Somió SL",
      address: "Cam. Nogales, 318, Periurbano - Rural, 33203 Gijón, Asturias, Spain",
      country: "ES",
      cif: "B67299438",
      dpo: {
        name: "Alex Lawton",
        email: "alex.lawton@miramonte.io",
      },
    },
    compliance: {
      gdpr: true,
      ccpa: true,
      cpra: true,
      ePrivacy: true,
      gpc: true,
    },
    dataCollection: {
      categories: [
        {
          name: "identifiers",
          collected: true,
          purpose: "Account creation and authentication",
          retention: "Until account deletion + 30 days",
          sold: false,
          shared: false,
        },
        {
          name: "internet_activity",
          collected: true,
          purpose: "Analytics and site improvement (with consent)",
          retention: "12 months",
          sold: false,
          shared: false,
        },
        {
          name: "geolocation",
          collected: false,
          purpose: "N/A",
          retention: "N/A",
          sold: false,
          shared: false,
        },
        {
          name: "commercial_information",
          collected: true,
          purpose: "Order processing for store purchases",
          retention: "7 years (legal requirement)",
          sold: false,
          shared: false,
        },
        {
          name: "inferences",
          collected: true,
          purpose: "Personalization (with consent)",
          retention: "12 months",
          sold: false,
          shared: false,
        },
        {
          name: "sensitive_personal_information",
          collected: false,
          purpose: "N/A",
          retention: "N/A",
          sold: false,
          shared: false,
        },
      ],
    },
    cookies: {
      categories: [
        {
          name: "essential",
          required: true,
          purpose: "Site functionality and security",
          cookies: ["sb-*-auth-token", "technodog_consent_preferences", "technodog_session_id"],
        },
        {
          name: "analytics",
          required: false,
          purpose: "Understanding site usage",
          cookies: ["_ga", "_ga_*", "_gid", "_gat"],
        },
        {
          name: "marketing",
          required: false,
          purpose: "Advertising effectiveness",
          cookies: ["_gcl_*"],
        },
        {
          name: "personalization",
          required: false,
          purpose: "User preferences",
          cookies: ["doggy_*", "technodog-cart"],
        },
      ],
    },
    rights: {
      gdpr: [
        "access",
        "rectification",
        "erasure",
        "restriction",
        "portability",
        "objection",
        "withdraw_consent",
      ],
      ccpa: [
        "know",
        "delete",
        "opt_out_sale",
        "opt_out_share",
        "correct",
        "limit_sensitive",
        "portability",
        "non_discrimination",
      ],
    },
    thirdParties: [
      {
        name: "Supabase Inc.",
        purpose: "Database & Authentication",
        dpaStatus: "signed",
        location: "USA",
        transferMechanism: "SCCs",
      },
      {
        name: "Shopify Inc.",
        purpose: "E-commerce Platform",
        dpaStatus: "signed",
        location: "Canada",
        transferMechanism: "Adequacy Decision",
      },
      {
        name: "Google LLC",
        purpose: "Analytics (with consent)",
        dpaStatus: "signed",
        location: "USA",
        transferMechanism: "SCCs",
      },
      {
        name: "Resend Inc.",
        purpose: "Transactional Email",
        dpaStatus: "signed",
        location: "USA",
        transferMechanism: "SCCs",
      },
      {
        name: "ElevenLabs Inc.",
        purpose: "Voice AI Services",
        dpaStatus: "signed",
        location: "USA",
        transferMechanism: "SCCs",
      },
    ],
    endpoints: {
      privacyPolicy: "https://techno.dog/privacy",
      cookiePolicy: "https://techno.dog/cookies",
      termsOfService: "https://techno.dog/terms",
      gdprRequest: "https://techno.dog/privacy#gdpr-request",
      ccpaRequest: "https://techno.dog/privacy#ccpa-request",
      doNotSell: "https://techno.dog/privacy#do-not-sell",
      consentSettings: "https://techno.dog/cookies#manage",
    },
    signals: {
      gpcHonored: true,
      dntHonored: true,
    },
  };

  // Check for specific format requests
  const url = new URL(req.url);
  const format = url.searchParams.get("format");

  if (format === "p3p") {
    // P3P Compact Policy (legacy but some crawlers still check)
    const p3p = `CP="NOI ADM DEV PSAi COM NAV OUR OTRo STP IND DEM"`;
    return new Response(p3p, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
        "P3P": p3p,
      },
    });
  }

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
});
