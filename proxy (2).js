// Vercel Serverless Function: /api/proxy
// Pobiera kanały RSS oraz weryfikuje status HTTP, przekierowania i paywalle bez ograniczeń CORS przeglądarki.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, mode = 'rss' } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Brak parametru url' });
  }

  let parsed;
  try {
    parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Nieobsługiwany protokół URL' });
    }
  } catch {
    return res.status(400).json({ error: 'Nieprawidłowy format URL' });
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
        'User-Agent': 'Mozilla/5.0 (compatible; NexusAINewsBot/1.0; +https://nexus-news.app)',
        'Accept': mode === 'rss'
          ? 'application/rss+xml, application/xml, text/xml, */*'
          : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    const finalUrl = response.url || parsed.toString();
    const text = await response.text();

    if (mode === 'verify') {
      const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      const pageTitle = titleMatch ? titleMatch[1].trim().slice(0, 140) : '';
      const hasPaywallTag = /paywall|subscribe-wall|piano-offer|isAccessibleForFree["']\s*:\s*false|tylko dla prenumeratorów|wykup dostęp/i.test(text);

      return res.status(200).json({
        ok: response.status >= 200 && response.status < 400,
        status: response.status,
        finalUrl,
        latency,
        pageTitle,
        hasPaywallTag
      });
    }

    return res.status(200).json({
      ok: response.ok,
      status: response.status,
      finalUrl,
      latency,
      contents: text
    });
  } catch (err) {
    return res.status(200).json({
      ok: false,
      status: 0,
      finalUrl: parsed.toString(),
      latency: Date.now() - start,
      error: err.name === 'AbortError' ? 'Timeout (9s)' : (err.message || 'Błąd połączenia')
    });
  }
}
