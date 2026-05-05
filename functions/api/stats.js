export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!env.STATS_KV) {
    return new Response(JSON.stringify({ error: 'KV namespace not configured' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // KST 기준 오늘 날짜 계산 (UTC+9)
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = now.toISOString().split('T')[0];

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || today;

    const [visits, payments] = await Promise.all([
      env.STATS_KV.get(`visits:${date}`),
      env.STATS_KV.get(`payments:${date}`),
    ]);

    return new Response(JSON.stringify({
      date,
      visits: parseInt(visits || '0'),
      payments: parseInt(payments || '0'),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { type } = body;
    if (type !== 'visit' && type !== 'payment') {
      return new Response(JSON.stringify({ error: 'type must be "visit" or "payment"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const key = `${type}s:${today}`;
    const current = await env.STATS_KV.get(key);
    const newCount = (parseInt(current || '0') + 1).toString();
    // 90일간 보관
    await env.STATS_KV.put(key, newCount, { expirationTtl: 60 * 60 * 24 * 90 });

    return new Response(JSON.stringify({ success: true, count: parseInt(newCount) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}
