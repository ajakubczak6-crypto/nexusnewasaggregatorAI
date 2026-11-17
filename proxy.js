// Netlify Function: /.netlify/functions/proxy (przekierowywane z /api/proxy)

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const { url, mode = 'rss' } = params;

  if (!url) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Brak parametru url' }) };
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Nieprawidłowy format URL' }) };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(parsed.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexusAINewsBot/1.0)'
      }
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    const finalUrl = response.url || parsed.toString();
    const text = await response.text();

    if (mode === 'verify') {
      const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      const pageTitle = titleMatch ? titleMatch[1].trim().slice(0, 140) : '';
      const hasPaywallTag = /paywall|subscribe-wall|piano-offer|isAccessibleForFree["']\s*:\s*false/i.test(text);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: response.status >= 200 && response.status < 400,
          status: response.status,
          finalUrl,
          latency,
          pageTitle,
          hasPaywallTag
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: response.ok,
        status: response.status,
        finalUrl,
        latency,
        contents: text
      })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: false,
        status: 0,
        finalUrl: parsed.toString(),
        latency: Date.now() - start,
        error: err.message || 'Błąd połączenia'
      })
    };
  }
}
