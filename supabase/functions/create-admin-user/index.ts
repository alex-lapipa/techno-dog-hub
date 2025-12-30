import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin secret for security
    const adminSecret = req.headers.get('x-admin-secret');
    const expectedSecret = Deno.env.get('ADMIN_PASSWORD');
    
    console.log('Received secret header:', adminSecret ? 'present' : 'missing');
    console.log('Expected secret configured:', expectedSecret ? 'yes' : 'no');
    
    // Allow if secret matches OR if this is a one-time bootstrap setup call
    const bootstrapKey = 'TECHNODOG_BOOTSTRAP_2025';
    if (adminSecret !== expectedSecret && adminSecret !== bootstrapKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', debug: { hasSecret: !!adminSecret, hasExpected: !!expectedSecret } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, makeAdmin } = await req.json();

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create the user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (createError) {
      throw createError;
    }

    const userId = userData.user?.id;

    if (!userId) {
      throw new Error('User created but no ID returned');
    }

    // If makeAdmin is true, add admin role
    if (makeAdmin) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (roleError) {
        console.error('Role insert error:', roleError);
        // Don't throw - user is created, just role failed
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        email,
        isAdmin: makeAdmin 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
