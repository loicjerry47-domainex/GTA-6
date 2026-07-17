/**
 * Static content generator for Vice Capital.
 *
 * Emits crawlable, zero-JS HTML pages into /public (guides, policy, about) plus
 * sitemap.xml and robots.txt. Pages are answer-first and carry Article / FAQ /
 * Breadcrumb JSON-LD for SEO + AEO/GEO (answer engines).
 *
 * Run:  SITE_URL="https://your-domain" CONTACT_EMAIL="you@your-domain" node scripts/gen-content.mjs
 * Output is committed to the repo, so the Vercel build needs no extra tooling.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');

const SITE_URL = (process.env.SITE_URL || 'https://gta6.wxza.net').replace(/\/$/, '');
const SITE_NAME = 'Vice Capital';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'hello@gta6.wxza.net';
const PUBLISHED = '2026-07-17';
const MODIFIED = '2026-07-17';
const UPDATED_HUMAN = 'July 17, 2026';

const abs = (p) => `${SITE_URL}${p}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── shared chrome ───────────────────────────────────────────── */
const LOGO = `<span class="mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg></span><span class="wordmark">VICE<span>CAPITAL</span></span>`;

const HEADER = `<header class="site-header"><div class="bar">
  <a class="brand" href="/">${LOGO}</a>
  <nav class="hnav">
    <a href="/">Command center</a>
    <a href="/guides/">Guides</a>
    <a href="/about/">About</a>
  </nav>
</div></header>`;

const FOOTER = `<footer class="site-footer"><div class="fgrid">
  <div class="fcol wide">
    <a class="brand" href="/">${LOGO}</a>
    <p>Treat the game as a market, not a toy. Independent GTA VI intelligence for the markets, the in-game economy, and the content economy.</p>
  </div>
  <div class="fcol"><h4>Guides</h4><ul>
    <li><a href="/guides/">All guides</a></li>
    <li><a href="/guides/gta-6-release-date/">Release date &amp; editions</a></li>
    <li><a href="/guides/how-to-invest-in-gta-6-ttwo-stock/">Invest in GTA 6 (TTWO)</a></li>
    <li><a href="/guides/how-to-make-money-gta-6-online/">Make money in GTA Online</a></li>
    <li><a href="/guides/gta-6-map-regions-leonida/">The map of Leonida</a></li>
  </ul></div>
  <div class="fcol"><h4>Company</h4><ul>
    <li><a href="/about/">About &amp; methodology</a></li>
    <li><a href="/legal/disclaimer/">Disclaimer</a></li>
    <li><a href="/legal/privacy/">Privacy policy</a></li>
    <li><a href="/legal/terms/">Terms of use</a></li>
  </ul></div>
</div>
<div class="fbar">
  <span>Not financial advice — informational and entertainment purposes only. Data snapshot ${UPDATED_HUMAN}.</span>
  <span>© 2026 ${SITE_NAME} · Unofficial fan project, not affiliated with Rockstar Games or Take-Two Interactive.</span>
</div></footer>`;

function breadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
  };
}
function articleSchema({ path, title, description }) {
  return {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: title, description, datePublished: PUBLISHED, dateModified: MODIFIED,
    inLanguage: 'en', mainEntityOfPage: abs(path), image: abs('/og-image.png'),
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: abs('/og-image.png') } },
  };
}
function faqSchema(items) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } })),
  };
}

/* ── body builders ───────────────────────────────────────────── */
const takeaways = (items) =>
  `<aside class="takeaways" aria-label="Key takeaways"><h2>Key takeaways</h2><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></aside>`;

const table = (headers, rows) =>
  `<div class="tablewrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

const faqBlock = (items) =>
  `<section class="faq"><h2>Frequently asked questions</h2>${items.map(f => `<div class="qa"><h3>${esc(f.q)}</h3><p>${f.a}</p></div>`).join('')}</section>`;

const disclaimerNote = `<p class="note"><strong>Not financial advice.</strong> This is educational and entertainment content. Do your own research; markets carry risk. See our <a href="/legal/disclaimer/">full disclaimer</a>.</p>`;

/* ── layout ──────────────────────────────────────────────────── */
function layout({ path, title, description, h1, kicker, updated = true, crumbs = [], jsonLd = [], body, ogType = 'article' }) {
  const canonical = abs(path);
  const schemas = [breadcrumbSchema([{ name: 'Home', path: '/' }, ...crumbs]), ...jsonLd];
  const crumbHtml = crumbs.length
    ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a>${crumbs.map((c, i) => ` <span>/</span> ${i === crumbs.length - 1 ? `<span aria-current="page">${esc(c.name)}</span>` : `<a href="${c.path}">${esc(c.name)}</a>`}`).join('')}</nav>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#ff6b00">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23ff6b00'/%3E%3Cpath d='M8 20l5-5 4 3 7-8' fill='none' stroke='white' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M20 10h4v4' fill='none' stroke='white' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="/content/style.css">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs('/og-image.png')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs('/og-image.png')}">
${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>
${HEADER}
<main class="content">
${crumbHtml}
<article>
<header class="art-head">
${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}
<h1>${h1}</h1>
${updated ? `<p class="meta">Last updated <time datetime="${MODIFIED}">${UPDATED_HUMAN}</time></p>` : ''}
</header>
${body}
</article>
</main>
${FOOTER}
</body>
</html>`;
}

function write(path, html) {
  const dir = join(PUBLIC, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  console.log('wrote', path + '/index.html');
}

/* ── pages ───────────────────────────────────────────────────── */
const pages = [];

/* HUB */
pages.push({
  path: '/guides/', changefreq: 'weekly', priority: 0.9,
  title: 'GTA 6 Money & Investing Guides (2026) | Vice Capital',
  description: 'Answer-first guides to the GTA 6 opportunity: release date and editions, how to invest via TTWO stock, how to make money in GTA Online, and the map of Leonida.',
  kicker: 'Guides', h1: 'GTA 6 money &amp; investing guides',
  crumbs: [{ name: 'Guides', path: '/guides/' }],
  ogType: 'website',
  body: `
<p class="lede">Everything you need to capitalize on the GTA 6 launch — on the markets, inside the game, and across the content economy. Each guide leads with the answer, then gives you the detail and the numbers.</p>
<div class="cards">
  <a class="card" href="/guides/gta-6-release-date/"><h2>GTA 6 release date, editions &amp; pre-orders</h2><p>November 19, 2026 on PS5 and Xbox Series X|S. Prices, pre-load, and why there's no PC version at launch.</p><span class="go">Read →</span></a>
  <a class="card" href="/guides/how-to-invest-in-gta-6-ttwo-stock/"><h2>How to invest in GTA 6 (TTWO stock)</h2><p>There's no "GTA 6 stock" — the pure-play is Take-Two (TTWO). Targets, catalysts, peripheral plays and the risks.</p><span class="go">Read →</span></a>
  <a class="card" href="/guides/how-to-make-money-gta-6-online/"><h2>How to make money in GTA 6 Online</h2><p>The ToS-safe playbook: own income assets early, price your time, and move first — no glitches, no bans.</p><span class="go">Read →</span></a>
  <a class="card" href="/guides/gta-6-map-regions-leonida/"><h2>The GTA 6 map: six regions of Leonida</h2><p>A Florida-inspired state nearly twice the size of GTA V. Every region's economy and opportunity, explained.</p><span class="go">Read →</span></a>
</div>
<p class="note">New to the project? Start at the <a href="/">interactive command center</a> or read <a href="/about/">how we build this</a>.</p>`,
});

/* GUIDE: release date */
{
  const faqs = [
    { q: 'When does GTA 6 come out?', a: 'Grand Theft Auto VI releases on <strong>November 19, 2026</strong>, a Tuesday, on PlayStation 5 and Xbox Series X|S.' },
    { q: 'Is GTA 6 coming to PC at launch?', a: 'No. There is no PC version at launch and no PC date has been announced. Based on Rockstar\'s history with GTA V and Red Dead Redemption 2, a PC release is widely expected roughly 12–24 months later.' },
    { q: 'How much does GTA 6 cost?', a: 'The Standard Edition is $79.99 and the Ultimate Edition is $99.99 in the US.' },
    { q: 'When can I pre-load GTA 6?', a: 'Digital pre-orders can pre-load starting November 12, 2026, ahead of the November 19 launch.' },
  ];
  pages.push({
    path: '/guides/gta-6-release-date/', changefreq: 'weekly', priority: 0.8,
    title: 'GTA 6 Release Date, Editions & Pre-Orders (2026) | Vice Capital',
    description: 'GTA 6 releases November 19, 2026 on PS5 and Xbox Series X|S. Standard $79.99, Ultimate $99.99. Pre-load Nov 12. No PC version at launch — here are the full details.',
    kicker: 'Guide · Launch', h1: 'GTA 6 release date, editions &amp; pre-orders',
    crumbs: [{ name: 'Guides', path: '/guides/' }, { name: 'Release date & editions', path: '/guides/gta-6-release-date/' }],
    jsonLd: [articleSchema({ path: '/guides/gta-6-release-date/', title: 'GTA 6 Release Date, Editions & Pre-Orders (2026)', description: 'GTA 6 releases November 19, 2026 on PS5 and Xbox Series X|S.' }), faqSchema(faqs)],
    body: `
<p class="lede"><strong>Grand Theft Auto VI launches on November 19, 2026</strong>, exclusively on PlayStation 5 and Xbox Series X|S. The Standard Edition is $79.99 and the Ultimate Edition is $99.99. There is no PC version at launch.</p>
${takeaways([
  'Release date: <strong>November 19, 2026</strong> (Tuesday).',
  'Platforms: <strong>PS5 and Xbox Series X|S only</strong> — no PC at launch.',
  'Prices: <strong>$79.99</strong> Standard · <strong>$99.99</strong> Ultimate.',
  'Pre-orders opened June 25, 2026; digital pre-load begins November 12, 2026.',
  'The physical edition ships a download code — no disc.',
])}
<h2>When does GTA 6 release?</h2>
<p>GTA 6 is locked for <strong>November 19, 2026</strong>. After being targeted for 2025 and then a spring 2026 window, Rockstar settled on a mid-November Tuesday — timed to capture the pre-Thanksgiving shopping surge and lead into Black Friday.</p>
<h2>What platforms is GTA 6 on?</h2>
<p>At launch, GTA 6 is a console exclusive on <strong>PlayStation 5</strong> and <strong>Xbox Series X|S</strong>. A PC version has not been announced. Rockstar's pattern (GTA V, RDR2) suggests PC typically follows 12–24 months after the console launch — a second sales wave the market has not yet priced.</p>
<h2>Editions and prices</h2>
${table(['Edition', 'Price (US)', 'Highlights'], [
  ['Standard', '$79.99', 'Base game'],
  ['Ultimate', '$99.99', 'Vehicles, weapons, apparel, story extras, a heist mission, and the pre-order Vice City pack'],
])}
<h2>Pre-orders and pre-load</h2>
<p>Pre-orders opened <strong>June 25, 2026</strong> across the PlayStation Store, Microsoft Store, Rockstar Store, and retailers. Digital pre-orders can <strong>pre-load from November 12, 2026</strong>. The physical edition contains a download code rather than a disc — a margin win for Take-Two and a signal of the all-digital future.</p>
<h2>What it means for investors</h2>
<p>The console-first, disc-less, staggered-PC strategy is a revenue-optimization playbook. If you're tracking the financial side, see <a href="/guides/how-to-invest-in-gta-6-ttwo-stock/">how to invest in GTA 6 via TTWO stock</a> and the live catalyst calendar on the <a href="/#timeline">command center</a>.</p>
${faqBlock(faqs)}
${disclaimerNote}`,
  });
}

/* GUIDE: invest / TTWO */
{
  const faqs = [
    { q: 'Is there a GTA 6 stock?', a: 'There is no standalone GTA 6 stock. The closest pure-play is <strong>Take-Two Interactive (NASDAQ: TTWO)</strong>, the parent of Rockstar Games, which develops and publishes the Grand Theft Auto series.' },
    { q: 'What is Take-Two\'s stock ticker?', a: 'Take-Two Interactive trades on the Nasdaq under the ticker <strong>TTWO</strong>.' },
    { q: 'Will TTWO go up when GTA 6 releases?', a: 'Analysts are broadly bullish, but game launches often follow a "buy the rumor, sell the news" pattern — the stock can peak before launch as expectations get priced in. The durable story is recurring revenue from GTA Online, not launch week alone. This is not financial advice.' },
    { q: 'What other stocks benefit from GTA 6?', a: 'Peripheral beneficiaries include Sony (PS5 hardware), and, more indirectly, GPU and peripheral makers. Impact is smaller and less direct than for TTWO.' },
  ];
  pages.push({
    path: '/guides/how-to-invest-in-gta-6-ttwo-stock/', changefreq: 'weekly', priority: 0.8,
    title: 'How to Invest in GTA 6: TTWO Stock, Targets & Catalysts (2026) | Vice Capital',
    description: 'There is no "GTA 6 stock" — the pure-play is Take-Two Interactive (TTWO). Analyst targets, the Aug 7 earnings and Trailer 3 catalysts, peripheral plays, and the risks.',
    kicker: 'Guide · Markets', h1: 'How to invest in GTA 6: TTWO stock &amp; the ecosystem',
    crumbs: [{ name: 'Guides', path: '/guides/' }, { name: 'Invest in GTA 6 (TTWO)', path: '/guides/how-to-invest-in-gta-6-ttwo-stock/' }],
    jsonLd: [articleSchema({ path: '/guides/how-to-invest-in-gta-6-ttwo-stock/', title: 'How to Invest in GTA 6: TTWO Stock, Targets & Catalysts', description: 'The pure-play on GTA 6 is Take-Two Interactive (TTWO).' }), faqSchema(faqs)],
    body: `
<p class="lede"><strong>There is no dedicated "GTA 6 stock."</strong> The pure-play is <strong>Take-Two Interactive (NASDAQ: TTWO)</strong>, parent of Rockstar Games. You can also play the ecosystem through peripheral names, but none has TTWO's direct exposure.</p>
${takeaways([
  'The pure-play is <strong>Take-Two Interactive (TTWO)</strong>.',
  'Snapshot (Jul 17, 2026): TTWO ~<strong>$243.91</strong>, 52-week range $188–$266, market cap ~$45B.',
  'Street-high target ~<strong>$368</strong>; consensus is bullish (Buy).',
  'Near-term catalysts: <strong>Q1 earnings on Aug 7</strong> and <strong>Trailer 3</strong> (late-July to mid-August).',
  'Watch for "sell the news": the durable story is recurring GTA Online revenue, not launch week.',
])}
<h2>Is there a GTA 6 stock?</h2>
<p>No single stock <em>is</em> GTA 6. The most direct exposure is <strong>TTWO</strong>, because Take-Two owns Rockstar Games and books Grand Theft Auto revenue. GTA V has generated an estimated $8.5B+ over its lifetime, and GTA Online's microtransactions (Shark Cards) have added billions more — which is why a single title moves a $45B company.</p>
<h2>TTWO snapshot</h2>
${table(['Metric', 'Value (snapshot · Jul 17, 2026)'], [
  ['Price', '~$243.91'],
  ['52-week range', '$188.23 – $265.94'],
  ['Market cap', '~$45.3B'],
  ['Street-high target', '$368'],
  ['Consensus', 'Buy'],
])}
<p class="note">Figures are a dated snapshot for education, not a live quote. Check a broker for real-time prices.</p>
<h2>The catalyst calendar</h2>
<p>The road to launch is paved with tradable events: <strong>Q1 FY earnings on August 7</strong>, an expected <strong>Trailer 3</strong> in late-July to mid-August, review embargoes in the autumn, the <strong>November 19 launch</strong>, and the first post-launch earnings call. Each is a volatility and attention event. The interactive <a href="/#timeline">timeline</a> maps them with impact ratings.</p>
<h2>Peripheral plays</h2>
${table(['Ticker', 'Why it is in the conversation', 'Directness'], [
  ['SONY', 'PS5 hardware and ecosystem lift on a major exclusive', 'Moderate'],
  ['MSFT', 'Xbox / Game Pass halo — small relative to Microsoft as a whole', 'Low'],
  ['NVDA', 'GPU upgrade cycle around the eventual PC release', 'Indirect'],
  ['CRSR / peripherals', 'New rigs and accessories; small-cap, high beta', 'Indirect'],
])}
<h2>The main risk: "sell the news"</h2>
<p>Highly anticipated launches frequently see the stock peak <em>before</em> release as expectations get priced in, then digest afterward. The real long-tail value is recurring revenue from GTA Online 2.0 — watch ARPU and retention on the first post-launch earnings call. Position accordingly, and never on leverage into a single binary date.</p>
${faqBlock(faqs)}
${disclaimerNote}`,
  });
}

/* GUIDE: make money online */
{
  const faqs = [
    { q: 'What is the fastest way to make money in GTA 6 Online?', a: 'Legitimately: complete the tutorial for unlocks, buy the cheapest property that generates passive income, then reinvest into stacking businesses. Prioritize income-producing assets over cosmetics, and quit any activity whose per-hour payout is below your target.' },
    { q: 'Is it safe to buy modded accounts or GTA cash?', a: 'No. Buying modded accounts, real-money currency (RMT), or paid boosting violates the game\'s Terms of Service and risks bans and wipes. It also gets sellers deplatformed by payment processors and ad networks. Stick to ToS-safe methods.' },
    { q: 'Should I buy Shark Cards?', a: 'Only after you own income assets. Early cars and cosmetics are quickly outclassed; put your first earnings into things that pay you back, not things that depreciate.' },
    { q: 'How do I price my time in GTA Online?', a: 'Divide a mission\'s payout by the minutes it takes, then multiply by 60 for an hourly rate. If it beats your target $/hour, run it; if not, find a better loop. Our command center has a mission ROI calculator for this.' },
  ];
  pages.push({
    path: '/guides/how-to-make-money-gta-6-online/', changefreq: 'weekly', priority: 0.8,
    title: 'How to Make Money in GTA 6 Online: The Capitalist Playbook | Vice Capital',
    description: 'The ToS-safe way to build wealth in GTA 6 Online: own income assets early, price your time, and move first. No glitches, no modded accounts, no bans.',
    kicker: 'Guide · In-game', h1: 'How to make money in GTA 6 Online',
    crumbs: [{ name: 'Guides', path: '/guides/' }, { name: 'Make money in GTA Online', path: '/guides/how-to-make-money-gta-6-online/' }],
    jsonLd: [articleSchema({ path: '/guides/how-to-make-money-gta-6-online/', title: 'How to Make Money in GTA 6 Online: The Capitalist Playbook', description: 'The ToS-safe way to build wealth in GTA 6 Online.' }), faqSchema(faqs)],
    body: `
<p class="lede"><strong>The fastest durable path is boring and it works:</strong> buy income-producing assets early, price your time ruthlessly, and be a first-mover on new content before the meta settles. No glitches, no modded accounts, no bans.</p>
${takeaways([
  'Buy the cheapest <strong>passive-income</strong> property first, then reinvest into stacking businesses.',
  'Assets are liabilities in disguise — supercars depreciate; production pays you back.',
  '<strong>Price your time</strong>: payout ÷ minutes × 60 = your $/hour. Quit anything below target.',
  'Be a <strong>first-mover</strong>: new businesses pay the most before the crowd arrives.',
  'Avoid RMT, modded accounts, and paid boosting — they get you banned and deplatformed.',
])}
<h2>The fastest legitimate methods</h2>
<p>On day one, complete the tutorial for unlocks, then acquire the cheapest property that produces passive income. From there, reinvest every payout into assets that compound — the classic GTA Online pattern is stacking a bunker or warehouse with a nightclub front so income accrues while you play.</p>
<h2>Own production, not toys</h2>
<p>The single biggest mistake is spending early cash on cosmetics and supercars that lose value the moment you drive them off the lot. Your first millions belong in <strong>income-generating assets</strong>. The flex is being rich, not looking rich.</p>
<h2>Price your time</h2>
<p>Every activity has an implicit hourly rate. If a mission pays 100k in 30 minutes, that's 200k/hour. Set a target $/hour and abandon anything below it. Our <a href="/#economy">mission ROI calculator</a> does the math and compares loops instantly.</p>
<h2>Be a first-mover</h2>
<p>New businesses and content pay the most <em>before</em> the meta settles and everyone piles in. Be early, document the optimal loop, and bank the premium while payouts are highest.</p>
<h2>What to avoid (and why)</h2>
<p>Modded-account sales, real-money currency trading, and paid boosting all violate the Terms of Service. Beyond bans and wipes, they get sellers cut off by payment processors and ad networks and invite legal exposure. The <a href="/guides/">legitimate businesses</a> around the game have a far higher ceiling because they can actually take sponsorships, ads, and card payments.</p>
${faqBlock(faqs)}
<p class="note">Based on GTA Online economic models; GTA 6 will iterate on these mechanics. For entertainment and education.</p>`,
  });
}

/* GUIDE: map / regions */
{
  const faqs = [
    { q: 'Where is GTA 6 set?', a: 'GTA 6 is set in the fictional US state of <strong>Leonida</strong>, a satirical take on Florida, centered on the Miami-inspired Vice City.' },
    { q: 'How big is the GTA 6 map?', a: 'Community estimates put Leonida at roughly twice the size of GTA V\'s Los Santos, with 700+ enterable interiors, making it Rockstar\'s largest map to date.' },
    { q: 'How many regions are in GTA 6?', a: 'At least six distinct regions: Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Hamlet, and Kelly County.' },
  ];
  pages.push({
    path: '/guides/gta-6-map-regions-leonida/', changefreq: 'monthly', priority: 0.7,
    title: 'The GTA 6 Map: All Six Regions of Leonida Explained | Vice Capital',
    description: 'GTA 6 is set in Leonida, a Florida-inspired state nearly twice the size of GTA V. Here are all six regions — Vice City, the Keys, Grassrivers, Port Gellhorn, Hamlet, Kelly County.',
    kicker: 'Guide · The world', h1: 'The GTA 6 map: six regions of Leonida',
    crumbs: [{ name: 'Guides', path: '/guides/' }, { name: 'The map of Leonida', path: '/guides/gta-6-map-regions-leonida/' }],
    jsonLd: [articleSchema({ path: '/guides/gta-6-map-regions-leonida/', title: 'The GTA 6 Map: All Six Regions of Leonida Explained', description: 'GTA 6 is set in Leonida, a Florida-inspired state.' }), faqSchema(faqs)],
    body: `
<p class="lede"><strong>GTA 6 is set in Leonida</strong>, a fictional, satirical version of Florida centered on the Miami-inspired <strong>Vice City</strong>. It's Rockstar's largest world yet — roughly twice the size of GTA V — divided into at least six regions, each with its own economy.</p>
${takeaways([
  'Setting: the fictional state of <strong>Leonida</strong> (Florida), anchored by Vice City.',
  'Scale: ~2× GTA V, with <strong>700+ enterable interiors</strong>.',
  'Six regions, each with a distinct economic profile and opportunity.',
])}
<h2>All six regions at a glance</h2>
${table(['Region', 'Inspired by', 'Economic profile'], [
  ['Vice City', 'Miami', 'High-density urban, nightlife, finance — the blue-chip'],
  ['Leonida Keys', 'Florida Keys', 'Maritime, smuggling routes, tourism'],
  ['Grassrivers', 'The Everglades', 'Hostile wetland — off-radar operations, high risk/reward'],
  ['Port Gellhorn', 'Fort Myers / Panama City', 'Industrial logistics — warehouses, import/export'],
  ['Hamlet', 'Rural Florida', 'Sleeper — cheap early property, hidden content'],
  ['Kelly County', 'Inland Florida', 'Depressed rural — deepest discounts, privacy plays'],
])}
<h2>How to read the map like a capitalist</h2>
<p>Lower-cost regions offer bigger percentage upside on early property; the urban core offers premium price with premium cash flow. Rockstar has hinted the map will keep expanding post-launch — buying into future expansion zones early is the in-game version of buying land before the highway gets built. Explore all six interactively on the <a href="/#map">command center map</a>.</p>
${faqBlock(faqs)}`,
  });
}

/* ABOUT */
pages.push({
  path: '/about/', changefreq: 'monthly', priority: 0.5,
  title: 'About Vice Capital — Methodology & Sources',
  description: 'Who we are, how we research the GTA 6 opportunity, where our data comes from, and how we keep it honest. Independent, unofficial, not financial advice.',
  kicker: 'About', h1: 'About Vice Capital',
  crumbs: [{ name: 'About', path: '/about/' }],
  body: `
<p class="lede">Vice Capital is an independent intelligence project covering the GTA 6 opportunity across three angles: the public markets, the in-game economy, and the content economy. We treat the game as a market, not a toy — and we're honest about what we know versus what we're estimating.</p>
<h2>What we do</h2>
<p>We synthesize public information — Rockstar and Take-Two announcements, market data, and analyst commentary — into an actionable, clearly-dated picture. The interactive <a href="/">command center</a> is the tool; these guides are the reference.</p>
<h2>Our methodology</h2>
<ul>
  <li><strong>Sourced and dated.</strong> Market figures are labeled with an "as of" date and treated as snapshots, never presented as live quotes unless a live feed is connected.</li>
  <li><strong>Confirmed vs. estimated.</strong> We separate what Rockstar has confirmed from credible leaks and our own projections.</li>
  <li><strong>ToS-safe only.</strong> We do not promote cheating, real-money trading, modded accounts, or anything that risks bans — we explain why those are dead ends.</li>
  <li><strong>Updated at catalysts.</strong> We refresh around trailers, earnings, and the launch.</li>
</ul>
<h2>Where our data comes from</h2>
<p>Public market data providers, Wall Street analyst notes, Rockstar's official announcements, and Take-Two's SEC filings. Where a claim is a leak or an estimate, we say so.</p>
<h2>Independence &amp; disclosures</h2>
<p>Vice Capital is an unofficial fan project and is not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. Some outbound links may be affiliate links. Nothing here is financial advice — see our <a href="/legal/disclaimer/">disclaimer</a>.</p>
<h2>Contact</h2>
<p>Questions or corrections: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`,
});

/* LEGAL: disclaimer */
pages.push({
  path: '/legal/disclaimer/', changefreq: 'yearly', priority: 0.3,
  title: 'Disclaimer | Vice Capital',
  description: 'Vice Capital is for information and entertainment only and is not financial advice. Independent, unofficial, not affiliated with Rockstar Games or Take-Two Interactive.',
  kicker: 'Legal', h1: 'Disclaimer',
  crumbs: [{ name: 'Disclaimer', path: '/legal/disclaimer/' }],
  body: `
<h2>Not financial advice</h2>
<p>All content on ${SITE_NAME} is provided for general informational and entertainment purposes only. It does not constitute financial, investment, tax, or legal advice, and it is not a recommendation to buy or sell any security, including Take-Two Interactive (TTWO). We are not registered investment advisers. Investing involves risk, including possible loss of principal. Always do your own research and consult a licensed professional before making financial decisions.</p>
<h2>Market data</h2>
<p>Stock prices, analyst targets, and related figures are snapshots as of the dates shown and may be delayed or out of date. Do not rely on them for trading decisions; verify with your broker or a live data source.</p>
<h2>Forward-looking statements</h2>
<p>Content about GTA 6 includes projections, leaks, and estimates that may be incomplete or incorrect. Release dates, features, and pricing can change. We distinguish confirmed information from speculation where possible, but make no guarantee of accuracy.</p>
<h2>In-game strategies</h2>
<p>Any in-game guidance is for entertainment. We do not endorse violating any game's Terms of Service. We explicitly do not promote cheating, exploits, real-money trading, or account sales.</p>
<h2>Affiliate links</h2>
<p>Some links may be affiliate links, meaning we could earn a commission at no extra cost to you. This never changes our editorial coverage.</p>
<h2>No affiliation</h2>
<p>${SITE_NAME} is an independent, unofficial fan project. It is not affiliated with, endorsed by, or sponsored by Rockstar Games, Take-Two Interactive, or any related entity. All trademarks belong to their respective owners.</p>
<p class="note">Questions: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`,
});

/* LEGAL: privacy */
pages.push({
  path: '/legal/privacy/', changefreq: 'yearly', priority: 0.3,
  title: 'Privacy Policy | Vice Capital',
  description: 'How Vice Capital handles your data: what we collect (email only if you provide it), privacy-friendly analytics, local storage, and your choices.',
  kicker: 'Legal', h1: 'Privacy policy',
  crumbs: [{ name: 'Privacy policy', path: '/legal/privacy/' }],
  body: `
<p class="lede">This policy explains what data ${SITE_NAME} collects and how it is used. In short: we collect the minimum, we don't sell your data, and analytics (if enabled) are privacy-friendly.</p>
<h2>Information we collect</h2>
<ul>
  <li><strong>Email &amp; alert preferences</strong> — only if you choose to submit them via the signup form, so we can send launch alerts you asked for.</li>
  <li><strong>Usage analytics</strong> — if analytics are enabled, we use a privacy-friendly, cookieless tool that collects aggregate, non-identifying metrics (pages viewed, referrer, device type). No personal profiles.</li>
  <li><strong>Local storage</strong> — your signup and preferences may be stored in your own browser to improve your experience. This never leaves your device unless a delivery endpoint is configured.</li>
</ul>
<h2>How we use it</h2>
<p>To deliver the alerts you request, understand aggregate traffic, and improve the site. We do not sell or rent your personal information.</p>
<h2>Third parties</h2>
<p>If you subscribe, your email may be processed by an email service provider (e.g., a form or newsletter tool) solely to deliver messages you opted into. Hosting and analytics providers process technical data on our behalf.</p>
<h2>Your choices</h2>
<p>You can unsubscribe from emails at any time, and clear local storage via your browser settings. To request access or deletion of any data you've provided, email us.</p>
<h2>Children</h2>
<p>This site is not directed to children under 13, and we do not knowingly collect their data.</p>
<h2>Changes &amp; contact</h2>
<p>We may update this policy; material changes will be reflected by the "last updated" date. Contact: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`,
});

/* LEGAL: terms */
pages.push({
  path: '/legal/terms/', changefreq: 'yearly', priority: 0.3,
  title: 'Terms of Use | Vice Capital',
  description: 'The terms governing your use of Vice Capital, including acceptable use, intellectual property, disclaimers, and limitation of liability.',
  kicker: 'Legal', h1: 'Terms of use',
  crumbs: [{ name: 'Terms of use', path: '/legal/terms/' }],
  body: `
<p class="lede">By using ${SITE_NAME}, you agree to these terms. If you don't agree, please don't use the site.</p>
<h2>Use of the site</h2>
<p>You may use this site for lawful, personal, non-commercial purposes. You agree not to misuse it, attempt to disrupt it, scrape it at scale, or use it to violate any law or any third party's Terms of Service.</p>
<h2>No advice, no warranty</h2>
<p>Content is provided "as is," for information and entertainment only, with no warranty of accuracy or fitness for a particular purpose. It is not financial advice. See our <a href="/legal/disclaimer/">disclaimer</a>.</p>
<h2>Intellectual property</h2>
<p>Our original content, design, and branding are owned by ${SITE_NAME}. "Grand Theft Auto," "GTA," and related marks are the property of Rockstar Games and Take-Two Interactive; we claim no rights to them and are not affiliated with them.</p>
<h2>Limitation of liability</h2>
<p>To the maximum extent permitted by law, ${SITE_NAME} is not liable for any loss or damage arising from your use of the site or reliance on its content, including any financial losses.</p>
<h2>Changes</h2>
<p>We may update these terms; continued use after changes constitutes acceptance. Contact: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`,
});

/* ── write everything ────────────────────────────────────────── */
for (const p of pages) write(p.path, layout(p));

/* sitemap.xml (include the SPA home too) */
const urls = [{ path: '/', changefreq: 'daily', priority: 1.0 }, ...pages.map(p => ({ path: p.path, changefreq: p.changefreq, priority: p.priority }))];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${abs(u.path)}</loc><lastmod>${MODIFIED}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(PUBLIC, 'sitemap.xml'), sitemap);
console.log('wrote sitemap.xml');

/* robots.txt */
writeFileSync(join(PUBLIC, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
console.log('wrote robots.txt');

console.log(`\nDone. ${pages.length} pages + sitemap + robots. SITE_URL=${SITE_URL}`);
