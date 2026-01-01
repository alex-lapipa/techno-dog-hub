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

// Email regex patterns - multiple patterns for better coverage
const EMAIL_REGEX_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  /href=["']mailto:([^"']+)["']/gi,
];

// Extract emails using regex from raw content
function extractEmailsWithRegex(content: string): string[] {
  const emails = new Set<string>();
  
  for (const pattern of EMAIL_REGEX_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      // Handle mailto: matches
      const email = (match[1] || match[0]).toLowerCase().replace(/^mailto:/i, '').trim();
      if (email.includes('@') && !email.includes('example.com') && !email.includes('placeholder')) {
        emails.add(email);
      }
    }
  }
  
  return Array.from(emails);
}

// Common contact page paths for EU brands
const CONTACT_PAGE_PATHS = [
  '/contact',
  '/kontakt',
  '/about',
  '/about-us',
  '/impressum',
  '/imprint',
  '/legal',
  '/info',
  '/team',
  '/booking',
  '/demos',
  '/submit',
];

// Scrape a URL using Firecrawl with both markdown and HTML
async function scrapeUrl(url: string, includeHtml = false): Promise<{ markdown: string | null; html: string | null }> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    console.error("FIRECRAWL_API_KEY not configured");
    return { markdown: null, html: null };
  }

  try {
    console.log(`Scraping: ${url}`);
    const formats = includeHtml ? ["markdown", "html"] : ["markdown"];
    
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats,
        onlyMainContent: false, // Get full page for emails in footers
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error for ${url}: ${response.status}`);
      return { markdown: null, html: null };
    }

    const data = await response.json();
    return {
      markdown: data.data?.markdown || data.markdown || null,
      html: data.data?.html || data.html || null,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { markdown: null, html: null };
  }
}

// Scrape multiple pages for an entity
async function scrapeEntityPages(baseUrl: string): Promise<{ allContent: string; allEmails: string[] }> {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  let allContent = "";
  const allEmails: string[] = [];
  
  // Scrape main page with HTML
  const mainResult = await scrapeUrl(normalizedBase, true);
  if (mainResult.markdown) allContent += mainResult.markdown + "\n\n";
  if (mainResult.html) {
    const regexEmails = extractEmailsWithRegex(mainResult.html);
    allEmails.push(...regexEmails);
  }
  
  // Scrape additional contact-related pages
  for (const path of CONTACT_PAGE_PATHS) {
    const pageUrl = `${normalizedBase}${path}`;
    const result = await scrapeUrl(pageUrl, true);
    
    if (result.markdown) {
      allContent += `\n\n--- Page: ${path} ---\n\n${result.markdown}`;
    }
    if (result.html) {
      const regexEmails = extractEmailsWithRegex(result.html);
      allEmails.push(...regexEmails);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Also extract from markdown content
  const markdownEmails = extractEmailsWithRegex(allContent);
  allEmails.push(...markdownEmails);
  
  // Deduplicate
  const uniqueEmails = [...new Set(allEmails)];
  console.log(`Found ${uniqueEmails.length} emails via regex: ${uniqueEmails.join(', ')}`);
  
  return { allContent, allEmails: uniqueEmails };
}

// Extract contacts from scraped content using AI, enhanced with regex-found emails
async function extractContacts(content: string, entityName: string, entityType: string, regexEmails: string[] = []): Promise<any[]> {
  const systemPrompt = `You are a data extraction expert for techno.dog, the global techno knowledge hub. 
Extract contact information from website content. Return valid JSON array only.

For each contact found, extract:
- contact_person_name: Full name if available (null if generic/unknown)
- role_title: Job title or role (e.g., "Press Contact", "Artist Relations", "Booking", "A&R")
- department: Department if mentioned (e.g., "Marketing", "A&R", "Support", "Booking")
- email: Email address
- phone: Phone number if available
- contact_type: One of: "general", "support", "press", "artist_relations", "sales", "a_and_r", "submissions", "booking", "demos"
- preferred_contact_method: "email" or "phone" or "form"
- notes: Any relevant context about this contact

IMPORTANT: These emails were found on the website: ${regexEmails.join(', ')}
Include ALL of them in your response, categorizing each appropriately.

Return ONLY a valid JSON array. If no contacts found, return [].`;

  const prompt = `Extract all contact information from this ${entityType} website content for "${entityName}":

${content.slice(0, 12000)}

Return JSON array of contacts found. Make sure to include ALL emails found.`;

  try {
    const result = await callOpenAI(prompt, systemPrompt);
    
    // Parse JSON from response
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    let contacts = [];
    if (jsonMatch) {
      contacts = JSON.parse(jsonMatch[0]);
    }
    
    // Ensure all regex emails are included
    const existingEmails = new Set(contacts.map((c: any) => c.email?.toLowerCase()));
    for (const email of regexEmails) {
      if (!existingEmails.has(email.toLowerCase())) {
        contacts.push({
          email: email.toLowerCase(),
          contact_type: categorizeEmail(email),
          preferred_contact_method: "email",
        });
      }
    }
    
    return contacts;
  } catch (error) {
    console.error("Error extracting contacts:", error);
    
    // Fallback: return regex emails as basic contacts
    return regexEmails.map(email => ({
      email: email.toLowerCase(),
      contact_type: categorizeEmail(email),
      preferred_contact_method: "email",
    }));
  }
}

// Categorize email based on common patterns
function categorizeEmail(email: string): string {
  const lower = email.toLowerCase();
  if (lower.includes('demo') || lower.includes('promo')) return 'demos';
  if (lower.includes('booking')) return 'booking';
  if (lower.includes('press') || lower.includes('pr@')) return 'press';
  if (lower.includes('a&r') || lower.includes('ar@') || lower.includes('andr@')) return 'a_and_r';
  if (lower.includes('info')) return 'general';
  if (lower.includes('support') || lower.includes('help')) return 'support';
  if (lower.includes('sales') || lower.includes('business')) return 'sales';
  if (lower.includes('contact')) return 'general';
  return 'general';
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

  const results = { processed: 0, contacts_found: 0, emails_found_regex: 0, errors: [] as string[] };

  for (const brand of brands || []) {
    try {
      const urlToScrape = brand.official_contact_page_url || brand.brand_website_url;
      
      // Use enhanced multi-page scraping
      const { allContent, allEmails } = await scrapeEntityPages(urlToScrape);
      results.emails_found_regex += allEmails.length;

      if (!allContent) {
        results.errors.push(`Failed to scrape ${brand.brand_name}`);
        continue;
      }

      // Extract contacts with regex emails as hints
      const contacts = await extractContacts(allContent, brand.brand_name, "gear manufacturer", allEmails);

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

  const results = { processed: 0, contacts_found: 0, emails_found_regex: 0, errors: [] as string[] };

  for (const label of labels || []) {
    try {
      // Use enhanced multi-page scraping
      const { allContent, allEmails } = await scrapeEntityPages(label.label_website_url);
      results.emails_found_regex += allEmails.length;

      if (!allContent) {
        results.errors.push(`Failed to scrape ${label.label_name}`);
        continue;
      }

      // Extract contacts with regex emails as hints
      const contacts = await extractContacts(allContent, label.label_name, "record label", allEmails);

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
