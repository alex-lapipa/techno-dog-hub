import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EnrichmentRequest {
  action: "enrich_brands" | "enrich_labels" | "enrich_single";
  entity_type?: "brand" | "label";
  entity_id?: string;
  limit?: number;
}

// Call Lovable AI Gateway for OpenAI
async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

// Scrape a URL using Firecrawl
async function scrapeUrl(url: string): Promise<string | null> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    console.error("FIRECRAWL_API_KEY not configured");
    return null;
  }

  try {
    console.log(`Scraping: ${url}`);
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error for ${url}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.data?.markdown || data.markdown || null;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Extract contacts from scraped content using AI
async function extractContacts(content: string, entityName: string, entityType: string): Promise<any[]> {
  const systemPrompt = `You are a data extraction expert for techno.dog, the global techno knowledge hub. 
Extract contact information from website content. Return valid JSON array only.

For each contact found, extract:
- contact_person_name: Full name if available (null if generic/unknown)
- role_title: Job title or role (e.g., "Press Contact", "Artist Relations", "Support")
- department: Department if mentioned (e.g., "Marketing", "A&R", "Support")
- email: Email address
- phone: Phone number if available
- contact_type: One of: "general", "support", "press", "artist_relations", "sales", "a_and_r", "submissions"
- preferred_contact_method: "email" or "phone" or "form"
- notes: Any relevant context about this contact

Return ONLY a valid JSON array. If no contacts found, return [].`;

  const prompt = `Extract all contact information from this ${entityType} website content for "${entityName}":

${content.slice(0, 8000)}

Return JSON array of contacts found.`;

  try {
    const result = await callOpenAI(prompt, systemPrompt);
    
    // Parse JSON from response
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Error extracting contacts:", error);
    return [];
  }
}

// Enrich brand contacts
async function enrichBrandContacts(supabase: any, brandId?: string, limit = 10) {
  let query = supabase
    .from("gear_brands")
    .select("id, brand_name, brand_website_url, official_contact_page_url")
    .not("brand_website_url", "is", null);

  if (brandId) {
    query = query.eq("id", brandId);
  } else {
    query = query.limit(limit);
  }

  const { data: brands, error } = await query;
  if (error) throw error;

  const results = { processed: 0, contacts_found: 0, errors: [] as string[] };

  for (const brand of brands || []) {
    try {
      // Scrape contact page first, fallback to main website
      const urlToScrape = brand.official_contact_page_url || brand.brand_website_url;
      const content = await scrapeUrl(urlToScrape);

      if (!content) {
        results.errors.push(`Failed to scrape ${brand.brand_name}`);
        continue;
      }

      // Also try to scrape /contact if not already
      let additionalContent = "";
      if (!brand.official_contact_page_url && brand.brand_website_url) {
        const contactUrl = `${brand.brand_website_url.replace(/\/$/, "")}/contact`;
        additionalContent = await scrapeUrl(contactUrl) || "";
      }

      const fullContent = content + "\n\n" + additionalContent;
      const contacts = await extractContacts(fullContent, brand.brand_name, "gear manufacturer");

      for (const contact of contacts) {
        if (!contact.email) continue;

        // Upsert to brand_contacts
        const { error: insertError } = await supabase
          .from("brand_contacts")
          .upsert({
            brand_id: brand.id,
            email: contact.email.toLowerCase().trim(),
            contact_person_name: contact.contact_person_name,
            role_title: contact.role_title,
            department: contact.department,
            phone: contact.phone,
            contact_type: contact.contact_type || "general",
            preferred_contact_method: contact.preferred_contact_method || "email",
            notes_on_how_to_approach: contact.notes,
            source_url: urlToScrape,
            enrichment_confidence: 0.8,
            last_verified_at: new Date().toISOString(),
          }, {
            onConflict: "email",
            ignoreDuplicates: true,
          });

        if (!insertError) {
          results.contacts_found++;

          // Also sync to crm_contacts
          await supabase.from("crm_contacts").upsert({
            email: contact.email.toLowerCase().trim(),
            full_name: contact.contact_person_name || "Unknown",
            organization_name: brand.brand_name,
            role_title: contact.role_title,
            stakeholder_type: "manufacturer",
            contact_source_db: "gear_brands",
            relationship_status: "new",
            verification_confidence: 0.8,
            last_verified_at: new Date().toISOString(),
          }, {
            onConflict: "email",
            ignoreDuplicates: true,
          });
        }
      }

      results.processed++;
      console.log(`Processed ${brand.brand_name}: ${contacts.length} contacts found`);

    } catch (err) {
      results.errors.push(`Error processing ${brand.brand_name}: ${err}`);
    }
  }

  return results;
}

// Enrich label contacts
async function enrichLabelContacts(supabase: any, labelId?: string, limit = 10) {
  let query = supabase
    .from("labels")
    .select("id, label_name, label_website_url, contact_form_url")
    .not("label_website_url", "is", null);

  if (labelId) {
    query = query.eq("id", labelId);
  } else {
    query = query.limit(limit);
  }

  const { data: labels, error } = await query;
  if (error) throw error;

  const results = { processed: 0, contacts_found: 0, errors: [] as string[] };

  for (const label of labels || []) {
    try {
      // Scrape main website
      const content = await scrapeUrl(label.label_website_url);

      if (!content) {
        results.errors.push(`Failed to scrape ${label.label_name}`);
        continue;
      }

      // Try /contact page too
      let additionalContent = "";
      const contactUrl = `${label.label_website_url.replace(/\/$/, "")}/contact`;
      additionalContent = await scrapeUrl(contactUrl) || "";

      const fullContent = content + "\n\n" + additionalContent;
      const contacts = await extractContacts(fullContent, label.label_name, "record label");

      for (const contact of contacts) {
        if (!contact.email) continue;

        // Upsert to label_contacts
        const { error: insertError } = await supabase
          .from("label_contacts")
          .upsert({
            label_id: label.id,
            email: contact.email.toLowerCase().trim(),
            contact_person_name: contact.contact_person_name,
            role_title: contact.role_title,
            department: contact.department,
            phone: contact.phone,
            source_url: label.label_website_url,
            enrichment_confidence: 0.8,
            last_verified_at: new Date().toISOString(),
          }, {
            onConflict: "email",
            ignoreDuplicates: true,
          });

        if (!insertError) {
          results.contacts_found++;

          // Also sync to crm_contacts
          await supabase.from("crm_contacts").upsert({
            email: contact.email.toLowerCase().trim(),
            full_name: contact.contact_person_name || "Unknown",
            organization_name: label.label_name,
            role_title: contact.role_title,
            stakeholder_type: "label",
            contact_source_db: "labels",
            relationship_status: "new",
            verification_confidence: 0.8,
            last_verified_at: new Date().toISOString(),
          }, {
            onConflict: "email",
            ignoreDuplicates: true,
          });
        }
      }

      results.processed++;
      console.log(`Processed ${label.label_name}: ${contacts.length} contacts found`);

    } catch (err) {
      results.errors.push(`Error processing ${label.label_name}: ${err}`);
    }
  }

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, entity_type, entity_id, limit = 10 }: EnrichmentRequest = await req.json();

    let result;

    switch (action) {
      case "enrich_brands":
        result = await enrichBrandContacts(supabase, undefined, limit);
        break;
      case "enrich_labels":
        result = await enrichLabelContacts(supabase, undefined, limit);
        break;
      case "enrich_single":
        if (entity_type === "brand") {
          result = await enrichBrandContacts(supabase, entity_id, 1);
        } else if (entity_type === "label") {
          result = await enrichLabelContacts(supabase, entity_id, 1);
        } else {
          throw new Error("Invalid entity_type");
        }
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Contact enrichment error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
