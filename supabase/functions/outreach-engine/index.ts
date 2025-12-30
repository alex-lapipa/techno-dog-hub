import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OutreachRequest {
  action: 'import_contacts' | 'generate_campaign' | 'compose_email' | 'preview_email' | 'send_email' | 'send_test' | 'get_freshness_signals' | 'qa_check' | 'sync_from_db';
  contactId?: string;
  campaignId?: string;
  templateId?: string;
  email?: string;
  subject?: string;
  body?: string;
  stakeholderType?: string;
  objective?: string;
  theme?: string;
  tone?: string;
  sourceDb?: string;
  testEmail?: string;
}

// Initialize Resend
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Lovable AI Gateway for OpenAI-style calls
async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Grok for freshness signals
async function callGrok(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: "You are Grok, a fast trend-aware scanner. Provide freshness signals, recent activity, and timeliness angles for outreach." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Core narrative and value propositions
const TECHNO_DOC_NARRATIVE = {
  mission: "Techno.doc is building the world's most comprehensive, community-driven archive of global techno culture — preserving the knowledge, stories, and connections that define this music and movement.",
  
  valueProps: {
    journalists: "Access to deep stories, verified data, artist archives, and a credible platform for techno journalism and cultural preservation.",
    labels: "Cultural stewardship for your catalog and artists, visibility through structured knowledge preservation, and partnership opportunities.",
    managers: "Storytelling infrastructure for artist legacies, structured archive access, and prestige through association with serious cultural documentation.",
    collectives: "Documentation and amplification of your community's work, resource-sharing, and visibility within a global network.",
    openSourceLeaders: "Shared open-source ethos, knowledge commons, community governance alignment, and collaborative development.",
    manufacturers: "Heritage documentation, artist culture connections, deep gear documentation, and content partnership opportunities.",
    sponsors: "Association with a high-integrity cultural platform with global reach, authentic techno community connection."
  },
  
  tone: {
    principles: [
      "Direct and intelligent, not hypey",
      "Culturally fluent for techno and underground scenes",
      "Respectful, not begging",
      "Grounded in integrity and long-term vision",
      "Non-salesy but persuasive through genuine value"
    ]
  },
  
  optOutFooter: "\n\n---\nIf you'd prefer not to receive emails from Techno.doc, reply with 'unsubscribe' and we'll remove you immediately."
};

// Generate campaign strategy
async function generateCampaignStrategy(objective: string, stakeholderType: string, theme: string, tone: string): Promise<any> {
  const systemPrompt = `You are a world-class PR strategist for Techno.doc, a cultural preservation platform for global techno.
  
Tone principles: ${TECHNO_DOC_NARRATIVE.tone.principles.join(', ')}

Value proposition for ${stakeholderType}: ${TECHNO_DOC_NARRATIVE.valueProps[stakeholderType as keyof typeof TECHNO_DOC_NARRATIVE.valueProps] || 'Cultural collaboration and mutual benefit'}`;

  const prompt = `Create a campaign strategy for:
- Objective: ${objective}
- Stakeholder type: ${stakeholderType}
- Theme: ${theme}
- Tone: ${tone}

Return JSON with:
{
  "campaignName": "...",
  "narrative": "...",
  "callToAction": "...",
  "sequence": [
    { "step": 1, "subject": "...", "summary": "...", "delayDays": 0 },
    { "step": 2, "subject": "...", "summary": "...", "delayDays": 5 },
    { "step": 3, "subject": "...", "summary": "...", "delayDays": 10 }
  ],
  "objections": ["...", "..."],
  "responseStrategies": ["...", "..."],
  "cadenceNotes": "..."
}`;

  const result = await callOpenAI(prompt, systemPrompt);
  return tryParseJSON(result);
}

// Compose personalized email
async function composeEmail(contact: any, campaign: any, template?: any): Promise<any> {
  const systemPrompt = `You are a world-class email writer for Techno.doc.

Mission: ${TECHNO_DOC_NARRATIVE.mission}

Tone principles: ${TECHNO_DOC_NARRATIVE.tone.principles.join(', ')}

Value proposition: ${TECHNO_DOC_NARRATIVE.valueProps[contact.stakeholder_type as keyof typeof TECHNO_DOC_NARRATIVE.valueProps] || 'Collaboration opportunity'}

RULES:
- Be concise (under 200 words for body)
- Use the recipient's name naturally
- Reference their work if known
- Clear CTA
- No fake enthusiasm or empty flattery
- Must include opt-out footer`;

  const contactContext = `
Contact: ${contact.full_name}
Organization: ${contact.organization_name || 'Unknown'}
Role: ${contact.role_title || 'Unknown'}
Type: ${contact.stakeholder_type}
Location: ${contact.city || ''}, ${contact.country || ''}
Tags: ${JSON.stringify(contact.tags_json || [])}
Notes: ${contact.personalization_notes || 'None'}
Relationship: ${contact.relationship_status}`;

  const campaignContext = campaign ? `
Campaign: ${campaign.campaign_name}
Objective: ${campaign.objective}
Theme: ${campaign.campaign_theme}
CTA: ${campaign.primary_call_to_action}` : '';

  const templateContext = template ? `
Base template to adapt:
Subject: ${template.subject_template}
Body: ${template.body_template_markdown}` : '';

  const prompt = `Compose a personalized email for this contact:

${contactContext}
${campaignContext}
${templateContext}

Return JSON:
{
  "subject": "...",
  "bodyHtml": "...",
  "bodyText": "...",
  "personalizationHooks": ["..."],
  "whyNow": "..."
}

Remember to include: ${TECHNO_DOC_NARRATIVE.optOutFooter}`;

  const result = await callOpenAI(prompt, systemPrompt);
  return tryParseJSON(result);
}

// Get freshness signals via Grok
async function getFreshnessSignals(contact: any): Promise<any> {
  const prompt = `For this contact in the techno/electronic music industry:
Name: ${contact.full_name}
Organization: ${contact.organization_name}
Role: ${contact.role_title}
Type: ${contact.stakeholder_type}

Provide freshness signals:
1. What might they have been doing recently? (releases, articles, events, announcements)
2. What's a good "why now" angle for outreach?
3. Any relevant industry trends affecting them?
4. Suggested personalization hooks based on their likely recent activity

Return JSON:
{
  "recentActivity": ["..."],
  "whyNowAngle": "...",
  "relevantTrends": ["..."],
  "suggestedHooks": ["..."],
  "confidenceLevel": "high|medium|low"
}`;

  const result = await callGrok(prompt);
  return tryParseJSON(result);
}

// QA check before sending
async function qaCheck(subject: string, body: string): Promise<any> {
  const systemPrompt = "You are a strict QA reviewer for professional outreach emails.";
  
  const prompt = `Review this email for quality and compliance:

Subject: ${subject}

Body:
${body}

Check for:
1. Professional tone (not hypey, not begging)
2. Clear value proposition
3. Personalization present
4. No spam trigger words
5. Reasonable length (under 300 words)
6. Clear CTA
7. Opt-out footer present
8. No broken personalization fields (like {{name}})
9. No excessive punctuation or caps

Return JSON:
{
  "passed": true/false,
  "score": 0-100,
  "issues": ["..."],
  "warnings": ["..."],
  "suggestions": ["..."]
}`;

  const result = await callOpenAI(prompt, systemPrompt);
  return tryParseJSON(result);
}

// Send email via Resend
async function sendEmail(to: string, subject: string, bodyHtml: string, bodyText: string, fromName: string = "Alex Lawton"): Promise<any> {
  console.log(`Sending email to ${to} with subject: ${subject}`);
  
  const emailResponse = await resend.emails.send({
    from: `${fromName} <onboarding@resend.dev>`,
    to: [to],
    subject: subject,
    html: bodyHtml,
    text: bodyText,
  });

  console.log("Resend response:", emailResponse);
  return emailResponse;
}

// Import contacts from source databases
async function importContactsFromDb(supabase: any, sourceDb: string, stakeholderType: string): Promise<any> {
  const imported: any[] = [];
  
  // Map source DBs to their tables and fields
  const sourceMappings: Record<string, { table: string; fields: any }> = {
    artist_managers: {
      table: 'artist_managers',
      fields: {
        full_name: 'manager_name',
        organization_name: 'management_company',
        role_title: 'manager_role',
        email: 'email',
        phone: 'phone',
        country: 'location_country',
        city: 'location_city'
      }
    },
    label_contacts: {
      table: 'label_contacts',
      fields: {
        full_name: 'contact_person_name',
        role_title: 'role_title',
        email: 'email',
        phone: 'phone',
        country: 'location_country',
        city: 'location_city'
      }
    },
    collective_key_people: {
      table: 'collective_key_people',
      fields: {
        full_name: 'person_name',
        role_title: 'role_title',
        email: 'email',
        phone: 'phone',
        country: 'location_country',
        city: 'location_city'
      }
    },
    brand_contacts: {
      table: 'brand_contacts',
      fields: {
        full_name: 'contact_person_name',
        role_title: 'role_title',
        email: 'email',
        phone: 'phone',
        country: 'location_country',
        city: 'location_city'
      }
    }
  };

  const mapping = sourceMappings[sourceDb];
  if (!mapping) {
    return { error: `Unknown source database: ${sourceDb}` };
  }

  const { data: sourceData, error } = await supabase
    .from(mapping.table)
    .select('*')
    .not('email', 'is', null)
    .limit(100);

  if (error) {
    console.error(`Error fetching from ${sourceDb}:`, error);
    return { error: error.message };
  }

  for (const record of sourceData || []) {
    // Check if already imported
    const { data: existing } = await supabase
      .from('crm_contacts')
      .select('id')
      .eq('email', record[mapping.fields.email])
      .single();

    if (existing) continue;

    // Check suppression list
    const { data: suppressed } = await supabase
      .from('suppression_list')
      .select('id')
      .eq('email', record[mapping.fields.email])
      .single();

    if (suppressed) continue;

    const contact = {
      external_contact_id: record.id,
      stakeholder_type: stakeholderType,
      full_name: record[mapping.fields.full_name] || 'Unknown',
      organization_name: record[mapping.fields.organization_name] || null,
      role_title: record[mapping.fields.role_title] || null,
      email: record[mapping.fields.email],
      phone: record[mapping.fields.phone] || null,
      country: record[mapping.fields.country] || null,
      city: record[mapping.fields.city] || null,
      contact_source_db: sourceDb,
      verification_confidence: record.enrichment_confidence || 50
    };

    const { data: inserted, error: insertError } = await supabase
      .from('crm_contacts')
      .insert(contact)
      .select()
      .single();

    if (inserted) imported.push(inserted);
    if (insertError) console.error('Import error:', insertError);
  }

  return { imported: imported.length, contacts: imported };
}

function tryParseJSON(str: string): any {
  try {
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { raw: str };
  } catch {
    return { raw: str };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: OutreachRequest = await req.json();
    const { action } = body;

    // Log the run
    const { data: run } = await supabase
      .from('outreach_engine_runs')
      .insert({
        run_type: action,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    let result: any;

    switch (action) {
      case 'sync_from_db':
      case 'import_contacts': {
        const { sourceDb, stakeholderType } = body;
        if (!sourceDb || !stakeholderType) {
          throw new Error("sourceDb and stakeholderType required");
        }
        result = await importContactsFromDb(supabase, sourceDb, stakeholderType);
        break;
      }

      case 'generate_campaign': {
        const { objective, stakeholderType, theme, tone } = body;
        if (!objective || !stakeholderType) {
          throw new Error("objective and stakeholderType required");
        }
        result = await generateCampaignStrategy(
          objective, 
          stakeholderType, 
          theme || 'general outreach', 
          tone || 'scene_native'
        );
        
        // Save campaign to DB
        if (result.campaignName) {
          const { data: campaign } = await supabase
            .from('campaigns')
            .insert({
              campaign_name: result.campaignName,
              objective,
              campaign_theme: theme,
              tone,
              audience_segment: { stakeholderType },
              primary_call_to_action: result.callToAction,
              created_by: 'outreach-engine'
            })
            .select()
            .single();

          result.campaignId = campaign?.id;

          // Save sequences
          if (result.sequence && campaign?.id) {
            for (const step of result.sequence) {
              await supabase
                .from('email_sequences')
                .insert({
                  campaign_id: campaign.id,
                  sequence_step: step.step,
                  delay_days: step.delayDays,
                  subject_template: step.subject,
                  body_template_markdown: step.summary
                });
            }
          }
        }
        break;
      }

      case 'compose_email': {
        const { contactId, campaignId, templateId } = body;
        if (!contactId) throw new Error("contactId required");

        const { data: contact } = await supabase
          .from('crm_contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (!contact) throw new Error("Contact not found");

        let campaign = null;
        if (campaignId) {
          const { data } = await supabase.from('campaigns').select('*').eq('id', campaignId).single();
          campaign = data;
        }

        let template = null;
        if (templateId) {
          const { data } = await supabase.from('templates_library').select('*').eq('id', templateId).single();
          template = data;
        }

        // Get freshness signals
        const freshness = await getFreshnessSignals(contact);
        
        // Compose email
        const email = await composeEmail(contact, campaign, template);
        
        result = { 
          ...email, 
          freshnessSignals: freshness,
          contact: { id: contact.id, email: contact.email, name: contact.full_name }
        };
        break;
      }

      case 'get_freshness_signals': {
        const { contactId } = body;
        if (!contactId) throw new Error("contactId required");

        const { data: contact } = await supabase
          .from('crm_contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (!contact) throw new Error("Contact not found");
        result = await getFreshnessSignals(contact);
        break;
      }

      case 'qa_check': {
        const { subject, body: emailBody } = body;
        if (!subject || !emailBody) throw new Error("subject and body required");
        result = await qaCheck(subject, emailBody);
        break;
      }

      case 'preview_email': {
        const { subject, body: emailBody, email: toEmail } = body;
        if (!subject || !emailBody) throw new Error("subject and body required for preview");
        result = {
          subject,
          body: emailBody,
          to: toEmail,
          preview: true,
          qaCheck: await qaCheck(subject, emailBody)
        };
        break;
      }

      case 'send_test': {
        const { subject, body: emailBody, testEmail } = body;
        if (!subject || !emailBody || !testEmail) {
          throw new Error("subject, body, and testEmail required");
        }

        const qa = await qaCheck(subject, emailBody);
        if (!qa.passed) {
          result = { error: "QA check failed", qa };
          break;
        }

        const sendResult = await sendEmail(testEmail, `[TEST] ${subject}`, emailBody, emailBody);
        result = { sent: true, resendId: sendResult.id, qa };
        break;
      }

      case 'send_email': {
        const { contactId, subject, body: emailBody, campaignId } = body;
        if (!contactId || !subject || !emailBody) {
          throw new Error("contactId, subject, and body required");
        }

        // Get contact
        const { data: contact } = await supabase
          .from('crm_contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (!contact) throw new Error("Contact not found");
        
        // Check suppression
        if (contact.suppression_status !== 'active') {
          throw new Error(`Contact is suppressed: ${contact.suppression_status}`);
        }

        // Check suppression list
        const { data: suppressed } = await supabase
          .from('suppression_list')
          .select('id')
          .eq('email', contact.email)
          .single();

        if (suppressed) {
          throw new Error("Email is on suppression list");
        }

        // Run QA
        const qa = await qaCheck(subject, emailBody);
        if (!qa.passed && qa.score < 60) {
          result = { error: "QA check failed", qa };
          break;
        }

        // Send via Resend
        const sendResult = await sendEmail(contact.email, subject, emailBody, emailBody);

        // Log in outreach_messages
        const { data: message } = await supabase
          .from('outreach_messages')
          .insert({
            campaign_id: campaignId || null,
            contact_id: contactId,
            resend_message_id: sendResult.id,
            subject,
            body_html: emailBody,
            body_text: emailBody,
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .select()
          .single();

        // Update contact
        await supabase
          .from('crm_contacts')
          .update({
            last_contacted_at: new Date().toISOString(),
            relationship_status: contact.relationship_status === 'new' ? 'warm' : contact.relationship_status
          })
          .eq('id', contactId);

        result = { 
          sent: true, 
          messageId: message?.id, 
          resendId: sendResult.id,
          qa 
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Update run status
    await supabase
      .from('outreach_engine_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        stats: { action, success: true }
      })
      .eq('id', run?.id);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Outreach engine error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
