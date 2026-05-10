// Cloudflare Worker — CORS proxy for Anthropic API
//
// Deploy steps:
// 1. Go to https://workers.cloudflare.com and create a free account
// 2. Create a new Worker, paste this file
// 3. Set ALLOWED_ORIGIN below to your app URL (e.g. https://honzabfu.github.io)
// 4. Deploy and copy the worker URL (e.g. https://my-worker.username.workers.dev)
// 5. Paste the worker URL into Language Tutor Settings → Proxy URL

const ALLOWED_ORIGIN = 'https://honzabfu.github.io'; // change to your app origin
const ANTHROPIC_BASE = 'https://api.anthropic.com';

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin');
    const allowed = ALLOWED_ORIGIN === '*' ? (origin || '*') : ALLOWED_ORIGIN;

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version, anthropic-beta',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const targetUrl = ANTHROPIC_BASE + url.pathname + url.search;

    const forwardHeaders = new Headers();
    for (const [key, value] of request.headers) {
      const lower = key.toLowerCase();
      if (lower === 'host' || lower === 'origin' || lower === 'referer') continue;
      forwardHeaders.set(key, value);
    }

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: forwardHeaders,
        body: request.body,
      });

      const responseHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(corsHeaders)) {
        responseHeaders.set(key, value);
      }

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: err.message } }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
