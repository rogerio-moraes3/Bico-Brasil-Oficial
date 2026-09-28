// search-edge-funcs-for-string: expects ?q=term and returns a simulated list of file paths and code snippets for demo
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  // Simulated response: in real project this function scans the repo. Here we return pre-known files.
  const data = [];
  if (q.includes('where_clause') || q.includes('location')) {
    data.push({ path: 'supabase/functions/search-workers/index.ts', matches: ['where_clause', 'location'] });
    data.push({ path: 'supabase/functions/nearby-workers/index.ts', matches: ['location'] });
    data.push({ path: 'supabase/functions/get-worker/index.ts', matches: ['where_clause'] });
  }
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
});