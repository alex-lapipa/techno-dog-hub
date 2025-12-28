import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

/**
 * Admin Auth Edge Function
 * 
 * This function validates admin access by checking the user_roles table.
 * It no longer uses password-based authentication.
 * 
 * Actions:
 * - verify: Check if the authenticated user has admin role
 */

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Authorization header required', 401);
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return errorResponse('Invalid or expired token', 401);
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('Role check error:', roleError);
      return errorResponse('Failed to verify admin status', 500);
    }

    const isAdmin = !!roleData;

    return jsonResponse({
      success: true,
      isAdmin,
      userId: user.id,
      email: user.email,
    });

  } catch (error) {
    console.error('Admin auth error:', error);
    return errorResponse('Server error', 500);
  }
});
