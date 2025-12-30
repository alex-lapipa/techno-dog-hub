import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  action: 'translate' | 'status' | 'glossary' | 'add-term' | 'remove-term' | 'test';
  content?: string;
  targetLanguage?: string;
  term?: string;
  category?: string;
  description?: string;
  termId?: string;
}

interface GlossaryTerm {
  id: string;
  term: string;
  category: string;
  description: string | null;
  is_active: boolean;
}

// Get protected terms from database
async function getProtectedTerms(supabase: any): Promise<GlossaryTerm[]> {
  const { data, error } = await supabase
    .from('translation_glossary')
    .select('*')
    .eq('is_active', true)
    .order('term');
  
  if (error) {
    console.error('Error fetching glossary:', error);
    return [];
  }
  
  return data || [];
}

// Translate content using Gemini while protecting glossary terms
async function translateContent(
  content: string,
  targetLanguage: string,
  protectedTerms: GlossaryTerm[],
  apiKey: string
): Promise<string> {
  // Build protected terms list
  const termsToProtect = protectedTerms.map(t => t.term).join(', ');
  
  const systemPrompt = `You are a professional translator for techno.dog, a global techno music encyclopedia.

CRITICAL RULES:
1. Translate the content to ${targetLanguage}
2. NEVER translate these protected terms - keep them exactly as written: ${termsToProtect}
3. Keep all brand names, artist names, venue names, and technical music terms in their original form
4. Maintain the original tone and style
5. Preserve all HTML tags, links, and formatting
6. City names like Berlin, Detroit, Tbilisi should remain in English
7. Music genre terms like Techno, Acid, Industrial should never be translated
8. Equipment names like TR-808, CDJ, Moog should never be translated

Return ONLY the translated text, no explanations.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Translate this to ${targetLanguage}:\n\n${content}` }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Translation failed: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || content;
}

// Test translation quality
async function testTranslation(
  testContent: string,
  targetLanguage: string,
  protectedTerms: GlossaryTerm[],
  apiKey: string
): Promise<{ translated: string; protectedTermsPreserved: string[]; protectedTermsViolated: string[] }> {
  const translated = await translateContent(testContent, targetLanguage, protectedTerms, apiKey);
  
  const protectedTermsPreserved: string[] = [];
  const protectedTermsViolated: string[] = [];
  
  // Check each protected term
  for (const term of protectedTerms) {
    if (testContent.includes(term.term)) {
      if (translated.includes(term.term)) {
        protectedTermsPreserved.push(term.term);
      } else {
        protectedTermsViolated.push(term.term);
      }
    }
  }
  
  return { translated, protectedTermsPreserved, protectedTermsViolated };
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body safely
    let body: TranslationRequest = { action: 'status' };
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
      console.log('No body or invalid JSON, defaulting to status action');
    }

    const { action } = body;

    // Get glossary terms
    const protectedTerms = await getProtectedTerms(supabase);

    switch (action) {
      case 'status': {
        // Get stats
        const { count: totalTerms } = await supabase
          .from('translation_glossary')
          .select('*', { count: 'exact', head: true });
        
        const { data: categories } = await supabase
          .from('translation_glossary')
          .select('category')
          .eq('is_active', true);
        
        const categoryCount: Record<string, number> = {};
        categories?.forEach((c: { category: string }) => {
          categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
        });

        // Update agent status
        await supabase
          .from('agent_status')
          .upsert({
            function_name: 'translation-agent',
            agent_name: 'Translation Agent',
            status: 'idle',
            category: 'content',
            last_run_at: new Date().toISOString(),
            config: { 
              supported_languages: ['es', 'de', 'fr', 'pt', 'it', 'ja', 'zh', 'ko', 'nl', 'pl'],
              total_protected_terms: totalTerms
            }
          }, { onConflict: 'function_name' });

        return new Response(JSON.stringify({
          success: true,
          stats: {
            totalProtectedTerms: totalTerms,
            categoryBreakdown: categoryCount,
            supportedLanguages: ['es', 'de', 'fr', 'pt', 'it', 'ja', 'zh', 'ko', 'nl', 'pl'],
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'glossary': {
        return new Response(JSON.stringify({
          success: true,
          glossary: protectedTerms,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'add-term': {
        const { term, category, description } = body;
        
        if (!term || !category) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Term and category are required',
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('translation_glossary')
          .insert({ term, category, description })
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({
            success: false,
            error: error.message,
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          term: data,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'remove-term': {
        const { termId } = body;
        
        if (!termId) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Term ID is required',
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error } = await supabase
          .from('translation_glossary')
          .delete()
          .eq('id', termId);

        if (error) {
          return new Response(JSON.stringify({
            success: false,
            error: error.message,
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          success: true,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'translate': {
        const { content, targetLanguage } = body;
        
        if (!content || !targetLanguage) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Content and target language are required',
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const translated = await translateContent(content, targetLanguage, protectedTerms, lovableApiKey);

        return new Response(JSON.stringify({
          success: true,
          original: content,
          translated,
          targetLanguage,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'test': {
        const { content, targetLanguage } = body;
        
        const testContent = content || `Welcome to techno.dog, the global Technopedia for underground Techno culture. 
Explore artists from Berlin and Detroit, discover gear like the TR-808 and Moog synthesizers, 
and learn about legendary venues like Berghain and Tresor. 
Our community of Doggies covers everything from Acid to Hard Techno.`;
        
        const testLang = targetLanguage || 'es';

        const result = await testTranslation(testContent, testLang, protectedTerms, lovableApiKey);

        return new Response(JSON.stringify({
          success: true,
          test: {
            original: testContent,
            ...result,
            targetLanguage: testLang,
            totalProtectedTermsInContent: result.protectedTermsPreserved.length + result.protectedTermsViolated.length,
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({
          success: false,
          error: `Unknown action: ${action}`,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error: unknown) {
    console.error('Translation agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
