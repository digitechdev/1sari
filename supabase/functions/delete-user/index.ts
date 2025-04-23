// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Import necessary modules
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"; // Or use a specific version
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Or use a specific version

// Import shared CORS headers (Make sure _shared/cors.ts exists)
import { corsHeaders } from '../_shared/cors.ts';

console.log("Delete User Function Initializing");

serve(async (req: Request) => {
  console.log(`Request Method: ${req.method}`);

  // --- CORS Preflight Handling ---
  // Handle OPTIONS requests immediately for CORS
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Request Processing ---
    const body = await req.json();
    const userId = body.userId; // Expecting { "userId": "..." } in the request body
    console.log(`Received request body:`, body);
    if (!userId) {
        console.error("User ID missing from request body.");
        throw new Error("User ID is required in the request body.");
    }
    console.log(`Attempting to delete user ID: ${userId}`);

    // --- Supabase Admin Client ---
    // Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in env vars
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.");
        throw new Error("Server configuration error: Missing Supabase credentials.");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("Supabase Admin Client created.");

    // --- Deletion Logic ---
    // 1. Delete from 'profiles' table (Best effort, optional)
    console.log(`Deleting profile for user ID: ${userId}`);
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (profileError) {
        // Log error but continue to attempt Auth deletion
        console.warn(`Warning: Error deleting profile for ${userId}: ${profileError.message}. Proceeding with Auth deletion.`);
    } else {
        console.log(`Successfully deleted profile (or profile did not exist) for ${userId}.`);
    }

    // 2. Delete user from Auth using Admin API
    console.log(`Deleting auth user ID: ${userId}`);
    const { data: deletion_data, error: deletion_error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deletion_error) {
      console.error(`Error deleting auth user ${userId}:`, deletion_error.message);
      // Throw error if Auth deletion fails, as it's the critical part
      throw new Error(`Failed to delete auth user: ${deletion_error.message}`);
    }
    console.log(`Successfully deleted auth user ${userId}. Data:`, deletion_data);

    // --- Success Response ---
    return new Response(JSON.stringify({ message: `User ${userId} deleted successfully` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Include CORS
      status: 200,
    });

  } catch (error) {
    console.error("Error caught in delete-user function:", error);
    // --- Error Response ---
    // Add type check for error message
    const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      // Check error type more robustly if possible
      status: (error instanceof Error && error.message.includes("NotFound")) ? 404 : 500,
    });
  }
});

console.log("Delete User Function Listener Started");

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
*/
