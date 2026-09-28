Deno.serve(async (req: Request) => {
  const SUPABASE_DB_URL = Deno.env.get('SUPABASE_DB_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_DB_URL || !SUPABASE_SERVICE_ROLE_KEY) return new Response('Missing env', { status:500 });

  // Call a Postgres RPC that performs the sync check and inserts alerts into admin.user_sync_alerts
  const res = await fetch(`${SUPABASE_DB_URL}/rpc/sync_auth_users`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });

  const text = await res.text();
  return new Response(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
});