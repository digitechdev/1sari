// supabase/functions/create-profile/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Try a slightly newer std version, ensure this matches Supabase compatibility if needed
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Define CORS headers - Adjust origin for production
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => { // Add type Request to req
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Ensure request is POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { id, email, full_name, role } = body;

    if (!id || !email) {
      return new Response(JSON.stringify({ error: 'Missing id or email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add CORS headers
      });
    }

    // Deno namespace should be available in Supabase Edge runtime
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
       return new Response(JSON.stringify({ error: 'Missing Supabase environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add CORS headers
      });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        // No CORS headers needed for server-to-server fetch
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        id,
        email,
        full_name: full_name || null, // Default to null if not provided
        role: role || 'viewer',       // Default to 'viewer' if not provided
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Supabase insert failed:', data);
      return new Response(JSON.stringify({ error: data.message || 'Insert failed' }), {
        status: response.status, // Use actual status from Supabase response
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add CORS headers
      });
    }

    // Return success response
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add CORS headers
    });

  } catch (err: unknown) { // Type err as unknown or any
    console.error('Function error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Add CORS headers
    });
  }
});
