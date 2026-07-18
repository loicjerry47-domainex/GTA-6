/**
 * GET /api/quote[?symbol=TTWO]
 *
 * Serverless quote proxy so the browser never talks to a third-party API
 * directly (and no API key ships to the client). Returns the shape the
 * frontend's useLiveQuote hook expects:
 *   { symbol, price, changePct, updatedAt }
 *
 * Source: Yahoo Finance's public chart endpoint — keyless but UNOFFICIAL, so it
 * can break or rate-limit at any time. That's acceptable by design: on any
 * failure the frontend silently falls back to its dated snapshot and labels it
 * "Snapshot · <date>". Edge-cached for 5 minutes to keep request volume tiny.
 *
 * Symbols are allowlisted so this can't be used as an open proxy.
 */
const ALLOWED = new Set(['TTWO', 'SONY', 'MSFT', 'NVDA', 'EA', 'CRSR']);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const symbol = String(req.query.symbol || 'TTWO').toUpperCase();
  if (!ALLOWED.has(symbol)) return res.status(400).json({ error: 'symbol not allowed' });

  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ViceCapital/1.0)' }, signal: AbortSignal.timeout(6000) }
    );
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const data = await r.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    const prev = meta?.chartPreviousClose ?? meta?.previousClose;
    if (typeof price !== 'number') throw new Error('no price in upstream response');

    const changePct = typeof prev === 'number' && prev > 0 ? ((price / prev - 1) * 100) : 0;
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      symbol,
      price: Math.round(price * 100) / 100,
      changePct: Math.round(changePct * 100) / 100,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Frontend treats any non-200 as "keep the labeled snapshot" — never a broken UI.
    return res.status(502).json({ error: 'quote unavailable' });
  }
}
