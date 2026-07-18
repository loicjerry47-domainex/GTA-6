/**
 * POST /api/subscribe   body: { email, alerts?: string[], ts?: string }
 *
 * Signup receiver. Validates the payload, then forwards it as JSON to the
 * webhook configured in the SUBSCRIBE_FORWARD_URL env var (server-side only —
 * set it in Vercel to a Formspree form, Zapier/Make hook, Buttondown, or your
 * own service).
 *
 * Honest degradation: with no SUBSCRIBE_FORWARD_URL configured this returns
 * 501, and the frontend keeps its local (browser-storage) copy without showing
 * the visitor an error. Configure the env var to make signups durable.
 */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { email, alerts, ts } = req.body ?? {};
  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid email' });
  }
  const cleanAlerts = Array.isArray(alerts)
    ? alerts.filter(a => typeof a === 'string' && a.length <= 40).slice(0, 10)
    : [];

  const forward = process.env.SUBSCRIBE_FORWARD_URL;
  if (!forward) return res.status(501).json({ error: 'no delivery endpoint configured' });

  try {
    const r = await fetch(forward, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        alerts: cleanAlerts,
        ts: typeof ts === 'string' ? ts : new Date().toISOString(),
        source: 'gta6.wxza.net',
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) throw new Error(`forward ${r.status}`);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'delivery failed' });
  }
}
