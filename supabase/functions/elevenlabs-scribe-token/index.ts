/**
 * ElevenLabs Scribe Token Generator
 * Returns single-use token for real-time speech-to-text
 * 
 * READ-ONLY: Only generates tokens, no database writes except analytics
 */

import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      console.error('[ScribeToken] ELEVENLABS_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'Voice transcription not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[ScribeToken] Requesting single-use token...');

    // Request single-use token for realtime Scribe
    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[ScribeToken] API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to generate transcription token' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { token } = await response.json();
    
    if (!token) {
      console.error('[ScribeToken] No token in response');
      return new Response(JSON.stringify({ 
        error: 'Invalid token response' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[ScribeToken] Token generated successfully');

    // Log token generation for rate limiting tracking
    const supabase = createServiceClient();
    supabase.from('analytics_events').insert({
      event_type: 'voice_stt',
      event_name: 'scribe_token_issued',
      metadata: {
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({
      token,
      expiresIn: 900 // 15 minutes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[ScribeToken] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
