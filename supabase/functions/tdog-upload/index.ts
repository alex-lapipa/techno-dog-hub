import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ALLOWED_PATTERNS = ['warehouse', 'minimal', 'industrial', 'acid', 'dub', 'hard', 'breakbeat'];
const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const contentType = req.headers.get('content-type') || '';
    
    let audioData: Uint8Array;
    let fileName: string;
    let mimeType: string;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form upload
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const patternName = formData.get('pattern') as string;

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!patternName || !ALLOWED_PATTERNS.includes(patternName)) {
        return new Response(
          JSON.stringify({ error: `Invalid pattern name. Allowed: ${ALLOWED_PATTERNS.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ error: 'File too large. Maximum size is 50MB' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      audioData = new Uint8Array(await file.arrayBuffer());
      fileName = `${patternName}-demo.mp3`;
      mimeType = file.type;

      console.log(`Processing multipart upload: ${fileName}, size: ${file.size}, type: ${mimeType}`);

    } else if (contentType.includes('application/json')) {
      // Handle base64 JSON upload
      const body = await req.json();
      const { pattern, audioBase64, contentType: audioContentType } = body;

      if (!pattern || !ALLOWED_PATTERNS.includes(pattern)) {
        return new Response(
          JSON.stringify({ error: `Invalid pattern name. Allowed: ${ALLOWED_PATTERNS.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!audioBase64) {
        return new Response(
          JSON.stringify({ error: 'No audio data provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Decode base64
      const binaryString = atob(audioBase64);
      audioData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        audioData[i] = binaryString.charCodeAt(i);
      }

      if (audioData.length > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ error: 'File too large. Maximum size is 50MB' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      fileName = `${pattern}-demo.mp3`;
      mimeType = audioContentType || 'audio/mpeg';

      console.log(`Processing base64 upload: ${fileName}, size: ${audioData.length}`);

    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported content type. Use multipart/form-data or application/json' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to storage bucket
    const { data, error } = await supabase.storage
      .from('tdog-demos')
      .upload(fileName, audioData, {
        contentType: mimeType,
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error('Upload error:', error);
      return new Response(
        JSON.stringify({ error: `Upload failed: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tdog-demos')
      .getPublicUrl(fileName);

    console.log(`Upload successful: ${fileName} -> ${urlData.publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        publicUrl: urlData.publicUrl,
        size: audioData.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: `Server error: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
