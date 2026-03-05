// Shared CORS headers for all edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Create a JSON response with CORS headers
export function jsonResponse(data: unknown, extraHeadersOrStatus?: number | Record<string, string>, statusCode?: number): Response {
  let status = 200;
  let extraHeaders: Record<string, string> = {};
  
  if (typeof extraHeadersOrStatus === 'number') {
    status = extraHeadersOrStatus;
  } else if (extraHeadersOrStatus) {
    extraHeaders = extraHeadersOrStatus;
    status = statusCode || 200;
  }
  
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extraHeaders },
  });
}

// Create an error response with CORS headers
export function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
