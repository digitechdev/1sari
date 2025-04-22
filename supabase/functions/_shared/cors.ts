// supabase/functions/_shared/cors.ts
export const corsHeaders = {
    // IMPORTANT: CHANGE '*' TO YOUR SPECIFIC APP ORIGINS FOR PRODUCTION!
    // Example: 'http://localhost:8100, https://your-live-app.com'
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Must include OPTIONS
  };