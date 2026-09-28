// sync_user_profile.ts
// Edge Function for Supabase (Deno)
// Receives user's access_token (Authorization header or body) and upserts into public.users via service role.

interface JwtPayload {
  sub?: string;
  email?: string;
  user_metadata?: any;
  [key: string]: any;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, '') || null;

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }
  const accessToken = tokenFromHeader || body.access_token || body.accessToken || null;
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Missing access token' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const payload = decodeJwtPayload(accessToken);
  if (!payload || !payload.sub) {
    return new Response(JSON.stringify({ error: 'Invalid token payload' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const userId = payload.sub as string;

  const nameFromJwt = (payload.user_metadata && (payload.user_metadata.full_name || payload.user_metadata.name)) || payload.email || null;
  const displayName = body.display_name || body.displayName || nameFromJwt || (payload.email ? String(payload.email).split('@')[0] : null) || undefined;
  const lastMode = body.last_mode || body.lastMode || 'contractor';

  const upsertBody: Record<string, unknown> = { id: userId };
  if (displayName !== undefined && displayName !== null) upsertBody.display_name = displayName;
  if (lastMode) upsertBody.last_mode = lastMode;

  try {
    const resp = await fetch(`${supabaseUrl}/rest/v1/users?on_conflict=id`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(upsertBody),
    });

    const text = await resp.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { json = text; }

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'Upsert failed', status: resp.status, body: json }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ ok: true, result: json }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Request failed', message: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
