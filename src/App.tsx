import { useState, useEffect, useRef } from 'react';
import type { ReactNode, FormEvent, MouseEvent } from 'react';
import {
  TrendingUp, Clock, DollarSign, Zap, Target, Users, BarChart3,
  Gamepad2, Video, Radio, ShoppingCart, Newspaper,
  AlertTriangle, CheckCircle2, Timer,
  Briefcase, Landmark, Wallet, Sparkles, Brain,
  Download, Gift,
  Megaphone, Swords, Flame, Shield, Eye,
  MapPin, Anchor, Waves, Building2, Factory, Trees, Mountain,
  ArrowUp, Coins, Menu
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

/* ═══════════════════════════════════════════
   SHARED PRIMITIVES — motion, count-up, chrome
   ═══════════════════════════════════════════ */
function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function CountUp({ value, prefix = '', suffix = '', decimals = 0, duration = 1500, className = '' }:
  { value: number; prefix?: string; suffix?: string; decimals?: number; duration?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplay(value); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setDisplay(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);
  const formatted = display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span ref={ref} className={className}>{prefix}{formatted}{suffix}</span>;
}

/* Fixed living backdrop behind all content */
function AnimatedBackdrop() {
  return (
    <div className="vc-backdrop" aria-hidden="true">
      <div className="vc-aurora vc-aurora--1" />
      <div className="vc-aurora vc-aurora--2" />
      <div className="vc-aurora vc-aurora--3" />
      <div className="vc-grid" />
      <div className="vc-noise" />
    </div>
  );
}

/* Top scroll-progress bar */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="vc-progress" style={{ width: `${pct}%` }} />;
}

/* Back-to-top button */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-600/30 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

/* Cash-burst easter egg — rains money emoji from the cursor/CTA */
function burstCash(x: number, y: number) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const glyphs = ['💵', '💰', '🤑', '💸', '🪙'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'vc-cash';
    el.textContent = glyphs[i % glyphs.length];
    el.style.left = `${x + (Math.random() - 0.5) * 120}px`;
    el.style.top = `${y - 20}px`;
    el.style.fontSize = `${18 + Math.random() * 22}px`;
    el.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 3200);
  }
}

/* ═══════════════════════════════════════════
   COUNTDOWN
   ═══════════════════════════════════════════ */
function Countdown() {
  const target = new Date('2026-11-19T00:00:00Z').getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const unit = (label: string, val: number) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-xl px-3 py-2 sm:px-5 sm:py-3 min-w-[64px] sm:min-w-[80px]">
        <span className="text-2xl sm:text-4xl font-bold mono text-white">{String(val).padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] sm:text-xs text-white/40 mt-2 uppercase tracking-widest">{label}</span>
    </div>
  );
  return <div className="flex gap-2 sm:gap-4">{unit('Days', d)}{unit('Hours', h)}{unit('Mins', m)}{unit('Secs', s)}</div>;
}

/* ═══════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   MARKET DATA — honest snapshot + live-ready hook
   ═══════════════════════════════════════════ */
const TTWO = {
  asOf: 'Jul 17, 2026',
  price: 243.91,
  changePct: 0.06,       // vs prior close (snapshot)
  monthChangePct: 12.9,
  low52: 188.23,
  high52: 265.94,
  ath: 265.94,
  marketCap: '$45.3B',
  fwdPE: '23.95',
  meanTarget: 301,       // mean of the tracked analyst targets below
};

/**
 * If VITE_QUOTE_ENDPOINT is set, fetch a live quote ({ price, changePct?, updatedAt? })
 * and use it; otherwise fall back to the dated snapshot above. Never blocks render,
 * never shows a broken state — stale data is always labeled as a snapshot.
 */
function useLiveQuote() {
  const [live, setLive] = useState<{ price: number; changePct: number; updatedAt: string } | null>(null);
  useEffect(() => {
    const endpoint = import.meta.env.VITE_QUOTE_ENDPOINT;
    if (!endpoint) return;
    let cancelled = false;
    fetch(endpoint)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('quote fetch failed'))))
      .then(d => {
        if (!cancelled && d && typeof d.price === 'number') {
          setLive({ price: d.price, changePct: typeof d.changePct === 'number' ? d.changePct : 0, updatedAt: d.updatedAt || 'live' });
        }
      })
      .catch(() => { /* keep snapshot */ });
    return () => { cancelled = true; };
  }, []);
  const price = live?.price ?? TTWO.price;
  const changePct = live?.changePct ?? TTWO.changePct;
  return { price, changePct, isLive: !!live, asOf: live?.updatedAt ?? TTWO.asOf };
}

/** Persist a signup locally and POST to VITE_SUBSCRIBE_ENDPOINT when configured. */
async function subscribeEmail(email: string, alerts: string[]): Promise<'ok' | 'duplicate'> {
  const entry = { email, alerts, ts: new Date().toISOString() };
  let duplicate = false;
  try {
    const key = 'vc_subscribers';
    const list: { email: string }[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (list.some(e => e.email.toLowerCase() === email.toLowerCase())) duplicate = true;
    else { list.push(entry); localStorage.setItem(key, JSON.stringify(list)); }
  } catch { /* storage unavailable — still attempt endpoint */ }
  const endpoint = import.meta.env.VITE_SUBSCRIBE_ENDPOINT;
  if (endpoint && !duplicate) {
    try {
      await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) });
    } catch { /* non-blocking: local copy is kept regardless */ }
  }
  return duplicate ? 'duplicate' : 'ok';
}

const CATALYST_ALERTS = ['Trailer 3', 'Review embargo', 'Launch day', 'Online launch'];

const NAV_LINKS = [
  { label: 'Map', href: '#map' },
  { label: 'Stocks', href: '#stocks' },
  { label: 'Economy', href: '#economy' },
  { label: 'Content', href: '#content' },
  { label: 'Arbitrage', href: '#arbitrage' },
  { label: 'Timeline', href: '#timeline' },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    NAV_LINKS.forEach(l => { const el = document.getElementById(l.href.slice(1)); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/[0.06]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 section-padding">
        <a href="#top" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">VICE<span className="text-orange-500">CAPITAL</span></span>
        </a>
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(l => {
            const isActive = active === l.href.slice(1);
            return (
              <a key={l.href} href={l.href} className={`text-sm transition-colors relative ${isActive ? 'text-orange-400' : 'text-white/50 hover:text-orange-400'}`}>
                {l.label}
                <span className={`absolute -bottom-1.5 left-0 h-px bg-orange-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0'}`} />
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <a href="#stocks" className="hidden sm:block">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-white text-xs shadow-lg shadow-orange-600/20 hover:shadow-orange-500/40 transition-shadow">Get the Edge</Button>
          </a>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0c0c0c] border-white/[0.08] w-[82%] max-w-xs p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <div className="flex items-center gap-2.5 px-6 h-16 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">VICE<span className="text-orange-500">CAPITAL</span></span>
              </div>
              <nav className="flex flex-col p-3">
                {NAV_LINKS.map(l => {
                  const isActive = active === l.href.slice(1);
                  return (
                    <SheetClose asChild key={l.href}>
                      <a href={l.href} className={`flex items-center justify-between px-4 py-3.5 rounded-lg text-base transition-colors ${isActive ? 'bg-orange-500/10 text-orange-400' : 'text-white/70 hover:text-white hover:bg-white/[0.04]'}`}>
                        {l.label}
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                      </a>
                    </SheetClose>
                  );
                })}
                <SheetClose asChild>
                  <a href="#stocks" className="mt-3">
                    <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20">Get the Edge</Button>
                  </a>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════ */
function EconomyTicker() {
  const items = [
    'GTA V lifetime revenue · $8.5B+',
    'Shark Cards to date · ~$5B',
    'TTWO · $243.91 ▲ this month +12.9%',
    'GTA VI Year-1 forecast · $3.2B',
    'Launch-day sales est. · $1.2B',
    'Top analyst target · $368 (+54%)',
    'GTA+ subscription · $7.99/mo',
    '64-player lobbies · targeting 96',
    'Ultimate Edition · $99.99',
    '700+ enterable interiors',
  ];
  const row = [...items, ...items];
  return (
    <div className="vc-ticker-track text-xs mono text-white/45">
      {row.map((t, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-orange-500" /> {t}
        </span>
      ))}
    </div>
  );
}

function Hero() {
  const [email, setEmail] = useState('');
  const [alerts, setAlerts] = useState<string[]>(['Launch day']);
  const [subscribed, setSubscribed] = useState(false);
  const q = useLiveQuote();
  const launch = new Date('2026-11-19T00:00:00Z').getTime();
  const daysToLaunch = Math.max(0, Math.ceil((launch - Date.now()) / 86400000));
  const topTarget = 368;
  const upsidePct = Math.round((topTarget / q.price - 1) * 100);

  const toggleAlert = (a: string) =>
    setAlerts(prev => (prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]));

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast.error('Enter a valid email to get launch intel.'); return; }
    const res = await subscribeEmail(email, alerts);
    if (res === 'duplicate') toast('You are already on the list.', { description: email });
    else toast.success('You are on the list. Launch intel incoming.', { description: alerts.length ? `Alerts: ${alerts.join(' · ')}` : email });
    setSubscribed(true);
    setEmail('');
  };

  const makeItRain = (e: MouseEvent<HTMLButtonElement>) => {
    burstCash(e.clientX, e.clientY);
    toast('Make it rain.', { description: 'Now channel that energy into owning the production, not the toys.' });
  };

  const stats: { label: string; node: ReactNode; sub: string; icon: typeof Clock }[] = [
    { label: 'Pre-Orders Live', node: 'June 25', sub: '$79.99 / $99.99', icon: ShoppingCart },
    { label: 'TTWO Price', node: <CountUp value={q.price} prefix="$" decimals={2} />, sub: q.isLive ? 'Live quote' : `Snapshot · ${q.asOf}`, icon: Target },
    { label: 'Top Price Target', node: <CountUp value={topTarget} prefix="$" />, sub: `+${upsidePct}% implied upside`, icon: TrendingUp },
    { label: 'Days to Launch', node: <CountUp value={daysToLaunch} />, sub: 'The clock is ticking', icon: Clock },
  ];

  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/hero-bg.jpg" alt="" loading="eager" fetchPriority="high" decoding="async" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
      </div>
      <div className="relative z-10 text-center section-padding max-w-5xl mx-auto pt-24 pb-16">
        <Badge className="bg-orange-500/15 text-orange-300 border-orange-500/25 mb-6 backdrop-blur-sm">
          <Zap className="w-3 h-3 mr-1.5" /> GTA VI — November 19, 2026
        </Badge>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.92] mb-6">
          THE GREATEST
          <br /><span className="text-shimmer">WEALTH EVENT</span>
          <br />IN GAMING HISTORY
        </h1>
        <p className="text-base sm:text-lg text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed">
          A new virtual economy is being born in real time. Whether you're chasing in-game billions,
          building a content empire, or positioning for the market ripple — this is your command center.
        </p>
        <div className="flex justify-center mb-10"><Countdown /></div>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <a href="#stocks"><Button size="lg" className="bg-orange-600 hover:bg-orange-500 text-white px-8 shadow-xl shadow-orange-600/20">Stock Intelligence</Button></a>
          <a href="#economy"><Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/8 px-8">In-Game Economy</Button></a>
          <Button size="lg" variant="outline" onClick={makeItRain} className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 px-6">
            <Coins className="w-4 h-4 mr-2" /> Make It Rain
          </Button>
        </div>

        {/* Email capture + catalyst alerts */}
        <div className="max-w-md mx-auto">
          <form onSubmit={submitEmail} className="glass-card p-1 flex gap-1">
            <Input type="email" placeholder="Enter email for launch alerts" value={email} onChange={e => setEmail(e.target.value)} className="bg-transparent border-0 text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0" />
            <Button type="submit" size="sm" className="bg-orange-600 hover:bg-orange-500 text-white whitespace-nowrap text-xs">{subscribed ? 'Update' : 'Get Alerts'}</Button>
          </form>
          <div className="flex flex-wrap justify-center gap-1.5 mt-2.5">
            {CATALYST_ALERTS.map(a => {
              const on = alerts.includes(a);
              return (
                <button key={a} type="button" onClick={() => toggleAlert(a)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${on ? 'bg-orange-500/15 border-orange-500/30 text-orange-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70'}`}>
                  {on ? '✓ ' : ''}{a}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-white/25 mt-2">{subscribed ? "Saved — we'll ping you at each catalyst you picked." : 'No spam. Pick the moments you want to hear about.'}</p>
        </div>

        {/* Stats row */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 max-w-3xl mx-auto">
          {stats.map(s => (
            <div key={s.label} className="glass-card p-3 sm:p-4 text-center hover:bg-white/[0.04] hover:-translate-y-0.5 transition-all">
              <s.icon className="w-4 h-4 text-orange-400 mx-auto mb-2" />
              <div className="text-base sm:text-xl font-bold mono">{s.node}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
              <div className="text-[9px] text-white/25 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live economy ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/[0.06] bg-black/40 backdrop-blur-md py-2.5 overflow-hidden">
        <EconomyTicker />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   THESIS DASHBOARD
   ═══════════════════════════════════════════ */
function ThesisDashboard() {
  const stats: { label: string; prefix?: string; value: number; decimals?: number; suffix?: string; desc: string }[] = [
    { label: 'GTA V Lifetime Revenue', prefix: '$', value: 8.5, decimals: 1, suffix: 'B+', desc: 'Best-selling entertainment product ever' },
    { label: 'GTA Online Annual Revenue', prefix: '$', value: 650, suffix: 'M+', desc: 'Peak years — microtransactions alone' },
    { label: 'GTA VI First-Year Forecast', prefix: '$', value: 3.2, decimals: 1, suffix: 'B+', desc: 'Analyst consensus across Wall Street' },
    { label: 'GTA Online 2.0 ARPU Target', prefix: '$', value: 45, suffix: '+', desc: 'Per-player annual spend, projected' },
    { label: 'Total Addressable Market', value: 200, suffix: 'M+', desc: 'Combined console + PC install base' },
    { label: 'Launch Day Sales Estimate', prefix: '$', value: 1.2, decimals: 1, suffix: 'B+', desc: 'First 24 hours — industry record' },
  ];

  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 relative" ref={ref}>
      <div className="max-w-7xl mx-auto section-padding">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">The Big Picture</span>
          <h2 className="text-3xl sm:text-5xl font-black mt-2 mb-4">Why This Is a <span className="text-gradient">Generational Event</span></h2>
          <p className="text-white/40 max-w-2xl mx-auto">The numbers don't lie. GTA V generated more revenue than the entire Marvel Cinematic Universe. GTA VI will dwarf it.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`glass-card p-5 hover:bg-white/[0.04] transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{s.label}</div>
              <div className="text-2xl sm:text-3xl font-black text-gradient mb-1">
                <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div className="text-xs text-white/40">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Revenue comparison */}
        <div className="mt-10 glass-card-strong p-6 sm:p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-orange-400" /> Revenue Comparison: Entertainment Giants</h3>
          <div className="space-y-5">
            {[
              { name: 'GTA V (Lifetime)', val: 8.5, color: 'bg-orange-500', label: '$8.5B+' },
              { name: 'GTA VI (Year 1 Est.)', val: 3.2, color: 'bg-amber-400', label: '$3.2B+' },
              { name: 'Avatar (Global Box Office)', val: 2.9, color: 'bg-white/20', label: '$2.9B' },
              { name: 'Avengers: Endgame', val: 2.8, color: 'bg-white/15', label: '$2.8B' },
              { name: 'Titanic', val: 2.2, color: 'bg-white/10', label: '$2.2B' },
            ].map(item => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className={item.color === 'bg-orange-500' || item.color === 'bg-amber-400' ? 'text-white font-medium' : 'text-white/50'}>{item.name}</span>
                  <span className="font-bold mono">{item.label}</span>
                </div>
                <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.val / 8.5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   REGIONS OF LEONIDA — the opportunity map
   ═══════════════════════════════════════════ */
const ACCENTS: Record<string, { text: string; bg: string; border: string; dot: string; bar: string }> = {
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500', bar: 'bg-orange-500' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-500', bar: 'bg-cyan-500' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  lime: { text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30', dot: 'bg-lime-500', bar: 'bg-lime-500' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-500', bar: 'bg-rose-500' },
};

const REGIONS = [
  {
    id: 'vice-city', name: 'Vice City', inspiration: 'Miami', icon: Building2, accent: 'orange',
    tagline: 'The crown jewel — neon, nightlife, and the highest ceilings on the map.',
    profile: 'High-density urban · nightlife · finance',
    angle: 'Highest property prices, but the highest income potential to match. Nightclubs and entertainment fronts double as laundering engines. Own the skyline and you tax the whole economy.',
    opportunities: ['Luxury property', 'High-value heists', 'Nightclub businesses', 'Entertainment fronts'],
    priceTier: 5, heat: 'Blue-chip',
  },
  {
    id: 'leonida-keys', name: 'Leonida Keys', inspiration: 'Florida Keys', icon: Anchor, accent: 'cyan',
    tagline: 'Island chain, open water, and a smuggling economy waiting for a landlord.',
    profile: 'Maritime · smuggling · tourism',
    angle: 'Control the waterways between islands and you effectively tax all maritime trade. Fleets scale from jet-ski couriers to yacht-class fronts, and coastal property rides the tourism wave.',
    opportunities: ['Boat-based businesses', 'Smuggling routes', 'Coastal property', 'Tourism & hospitality'],
    priceTier: 4, heat: 'High-growth',
  },
  {
    id: 'grassrivers', name: 'Grassrivers', inspiration: 'The Everglades', icon: Waves, accent: 'emerald',
    tagline: 'Hostile wetland — alligators, storms, and everything you want off the radar.',
    profile: 'Rural · hostile · hidden',
    angle: 'Remoteness is the product. Labs, chop shops, and drop points stay invisible out here. Tropical storms create supply shocks that sharp players arbitrage. High risk, high margin.',
    opportunities: ['Off-radar operations', 'Survivalist content', 'Resource extraction', 'Storm arbitrage'],
    priceTier: 2, heat: 'Speculative',
  },
  {
    id: 'port-gellhorn', name: 'Port Gellhorn', inspiration: 'Fort Myers / Panama City', icon: Factory, accent: 'amber',
    tagline: 'Industrial harbor town — the logistics backbone of Leonida.',
    profile: 'Industrial · logistics · working-class',
    angle: 'Cheaper than Vice City with strong returns on warehousing and import/export. Its own police force means predictable patrol patterns you can route product around.',
    opportunities: ['Warehouses', 'Import / export', 'Distribution centers', 'Blue-collar fronts'],
    priceTier: 3, heat: 'Value',
  },
  {
    id: 'hamlet', name: 'Hamlet', inspiration: 'Rural Florida', icon: Trees, accent: 'lime',
    tagline: 'Sleepy on the surface — eccentric NPCs, easter eggs, and cheap early upside.',
    profile: 'Suburban / rural · eccentric',
    angle: 'Rural GTA has always hidden the best early-game money: low police presence, cheap property, and specialized ops the whales overlook. Hidden content rewards the patient.',
    opportunities: ['Early-game property', 'Specialized ops', 'Hidden content', 'Low-competition niches'],
    priceTier: 2, heat: 'Sleeper',
  },
  {
    id: 'kelly-county', name: 'Kelly County', inspiration: 'Inland Florida', icon: Mountain, accent: 'rose',
    tagline: 'Backwoods and trailer parks — the most depressed county, the deepest discounts.',
    profile: 'Depressed rural · backwoods',
    angle: 'Rock-bottom property values mean early investments here can post the biggest percentage returns. Distance from police hubs makes it the privacy play for operations that need to disappear.',
    opportunities: ['Low-cost property', 'Off-grid businesses', 'Privacy operations', 'Percentage-return plays'],
    priceTier: 1, heat: 'Deep value',
  },
];

function RegionsSection() {
  const [sel, setSel] = useState(REGIONS[0].id);
  const region = REGIONS.find(r => r.id === sel) ?? REGIONS[0];
  const a = ACCENTS[region.accent];
  const RIcon = region.icon;

  return (
    <section id="map" className="py-24 relative">
      <div className="relative z-10 max-w-7xl mx-auto section-padding reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">The Opportunity Map</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black mb-4">Six Regions, <span className="text-gradient">One Economy</span></h2>
        <p className="text-white/40 max-w-2xl mb-10">
          Leonida is nearly twice the size of GTA V's map, and every region has its own economic profile.
          Tap a region to read the capitalist angle before the masses ever load in.
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Region selector */}
          <div className="region-scroll lg:col-span-1 flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {REGIONS.map(r => {
              const ra = ACCENTS[r.accent];
              const isActive = r.id === sel;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => setSel(r.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all flex-shrink-0 lg:flex-shrink w-[220px] lg:w-full border ${isActive ? `${ra.bg} ${ra.border}` : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? ra.bg : 'bg-white/[0.04]'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? ra.text : 'text-white/40'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white/70'}`}>{r.name}</div>
                    <div className="text-[10px] text-white/30 truncate">based on {r.inspiration}</div>
                  </div>
                  {isActive && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${ra.dot} animate-pulse`} />}
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div key={region.id} className="lg:col-span-2 glass-card-strong p-6 sm:p-8 animate-fade-in">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${a.bg} border ${a.border}`}>
                  <RIcon className={`w-7 h-7 ${a.text}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-black">{region.name}</h3>
                  <p className="text-xs text-white/40">Inspired by {region.inspiration} · {region.profile}</p>
                </div>
              </div>
              <Badge className={`${a.bg} ${a.text} border ${a.border}`}>{region.heat}</Badge>
            </div>

            <p className={`text-lg font-semibold mb-4 ${a.text}`}>{region.tagline}</p>
            <p className="text-sm text-white/55 leading-relaxed mb-6">{region.angle}</p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2.5">Where the money is</div>
                <div className="flex flex-wrap gap-2">
                  {region.opportunities.map(o => (
                    <span key={o} className={`text-xs px-2.5 py-1 rounded-md ${a.bg} ${a.text} border ${a.border}`}>{o}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2.5">Entry property cost</div>
                <div className="flex gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className={`h-2.5 flex-1 rounded-full ${n <= region.priceTier ? a.bar : 'bg-white/[0.06]'}`} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-white/35">
                  <span>Bargain basement</span><span>Blue-chip</span>
                </div>
                <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
                  Lower tiers = cheaper entry and bigger percentage upside. Higher tiers = premium price, premium cash flow.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 glass-card p-5 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/45 leading-relaxed">
            Rockstar has hinted the map will keep expanding post-launch — a rumored <span className="text-orange-300">Gloriana</span> (Georgia) region and new cities within Leonida.
            Early property in expansion zones is the in-game equivalent of buying land before the highway gets built.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   STOCK INTELLIGENCE HUB
   ═══════════════════════════════════════════ */
function StockHub() {
  const [tab, setTab] = useState<'ttwo' | 'peripherals' | 'history'>('ttwo');
  const q = useLiveQuote();

  const analysts = [
    { firm: 'BofA Securities', target: 368, rating: 'Buy', date: 'Jun 23' },
    { firm: 'DA Davidson', target: 300, rating: 'Buy', date: 'Jun 15' },
    { firm: 'BTIG', target: 290, rating: 'Buy', date: 'Jun 24' },
    { firm: 'BMO Capital', target: 285, rating: 'Outperform', date: 'Jun 25' },
    { firm: 'Piper Sandler', target: 280, rating: 'Overweight', date: 'Jun 2' },
    { firm: 'Wells Fargo', target: 287, rating: 'Overweight', date: 'May 22' },
    { firm: 'Wedbush', target: 300, rating: 'Outperform', date: 'Jan 29' },
    { firm: 'UBS', target: 300, rating: 'Buy', date: 'Jan 28' },
  ];

  const peripherals = [
    { ticker: 'SONY', name: 'Sony Group', price: '$25.54', thesis: 'PS5 Pro hardware bump on major exclusives. Console sales spike expected.', upside: 'Moderate' },
    { ticker: 'MSFT', name: 'Microsoft', price: '$493.51', thesis: 'Game Pass subs + cloud streaming push. Less direct impact than Sony.', upside: 'Low' },
    { ticker: 'CRSR', name: 'Corsair Gaming', price: '$12.80', thesis: 'Peripheral demand from new PC builds. Small-cap, high beta.', upside: 'High' },
    { ticker: 'NVDA', name: 'NVIDIA', price: '$142.30', thesis: 'GPU upgrades for 4K/ray-traced VI. Already pricing in AI growth.', upside: 'Moderate' },
    { ticker: 'EA', name: 'Electronic Arts', price: '$148.20', thesis: 'Sector rotation on gaming enthusiasm. Indirect beneficiary.', upside: 'Low' },
  ];

  const upside = (t: number) => ((t / q.price - 1) * 100).toFixed(0);
  const meanTarget = Math.round(analysts.reduce((s, a) => s + a.target, 0) / analysts.length);

  return (
    <section id="stocks" className="py-24 relative">
      <div className="absolute inset-0 opacity-15">
        <img src="/stock-desk.jpg" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto section-padding reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">Market Intelligence</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black mb-4">The Real-World <span className="text-gradient">Capital Play</span></h2>
        <p className="text-white/40 max-w-2xl mb-10">You don't need to own TTWO to profit from the hype cycle. Understand the ecosystem, track the signals, and position ahead of the crowd.</p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {[{ k: 'ttwo', l: 'TTWO (Primary)' }, { k: 'peripherals', l: 'Peripheral Plays' }, { k: 'history', l: 'Hype Cycle Chart' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.k ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/8'}`}>{t.l}</button>
          ))}
        </div>

        {tab === 'ttwo' && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Main card */}
            <div className="lg:col-span-3 glass-card-strong p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold">TTWO</h3>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25">Strong Buy</Badge>
                    {q.isLive
                      ? <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" /> LIVE</Badge>
                      : <Badge className="bg-white/[0.06] text-white/45 border-white/[0.08]">Snapshot · {q.asOf}</Badge>}
                  </div>
                  <p className="text-xs text-white/30">Take-Two Interactive Software, Inc.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mono">${q.price.toFixed(2)}</div>
                  <div className="flex items-center justify-end gap-1 text-emerald-400 text-sm"><TrendingUp className="w-3.5 h-3.5" /> +{TTWO.monthChangePct}% this month</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[{ label: '52W Range', val: `$${TTWO.low52} – $${TTWO.high52}` }, { label: 'ATH', val: `$${TTWO.ath}` }, { label: 'Market Cap', val: TTWO.marketCap }, { label: 'Forward P/E', val: TTWO.fwdPE }].map(s => (
                  <div key={s.label} className="bg-white/[0.02] rounded-lg p-3">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</div>
                    <div className="text-sm font-semibold mono mt-1">{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-3"><Newspaper className="w-4 h-4 text-orange-400" /><span className="text-sm font-medium">Latest Catalyst</span></div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Pre-orders are live (<span className="text-white font-medium">$79.99</span> / <span className="text-white font-medium">$99.99</span>), disc-less physical confirmed.
                  TTWO is up <span className="text-emerald-400 font-medium">~{TTWO.monthChangePct}%</span> this month heading into <span className="text-white font-medium">Q1 earnings on Aug 7</span>, with <span className="text-white font-medium">Trailer 3</span> expected late-July to mid-August.
                  BofA's Street-high target sits at <span className="text-emerald-400 font-medium">$368</span> (+{upside(368)}% from here).
                </p>
              </div>
            </div>
            {/* Analysts */}
            <div className="lg:col-span-2 glass-card p-5">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-orange-400" /> Analyst Targets</h4>
              <div className="space-y-3">
                {analysts.map(a => (
                  <div key={a.firm} className="flex items-center justify-between">
                    <div><div className="text-xs font-medium">{a.firm}</div><div className="text-[10px] text-white/30">{a.date}</div></div>
                    <div className="text-right"><div className="text-sm font-bold mono text-emerald-400">${a.target}</div><div className="text-[10px] text-orange-400">+{upside(a.target)}%</div></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-1">
                <div className="flex justify-between text-sm"><span className="text-white/40">Mean Target</span><span className="font-bold mono text-emerald-400">${meanTarget}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/40">Implied Upside</span><span className="font-bold mono text-emerald-400">+{upside(meanTarget)}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/40">Consensus</span><span className="font-bold text-emerald-400">Buy</span></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'peripherals' && (
          <div className="glass-card-strong p-6 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead><tr className="text-left text-[10px] text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
                <th className="pb-3 font-medium">Ticker</th><th className="pb-3 font-medium">Company</th><th className="pb-3 font-medium">Price</th><th className="pb-3 font-medium">Thesis</th><th className="pb-3 font-medium">Upside</th>
              </tr></thead>
              <tbody>{peripherals.map((p, i) => (
                <tr key={p.ticker} className={`border-b border-white/[0.04] ${i === peripherals.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="py-4 font-bold mono text-orange-400">{p.ticker}</td>
                  <td className="py-4 text-sm">{p.name}</td>
                  <td className="py-4 text-sm mono">{p.price}</td>
                  <td className="py-4 text-xs text-white/40 max-w-xs">{p.thesis}</td>
                  <td className="py-4"><Badge className={`text-[10px] ${p.upside === 'High' ? 'bg-emerald-500/15 text-emerald-400' : p.upside === 'Moderate' ? 'bg-orange-500/15 text-orange-400' : 'bg-white/8 text-white/40'}`}>{p.upside}</Badge></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {tab === 'history' && (
          <div className="glass-card-strong p-4 sm:p-6">
            <img src="/ttwo-full-chart.png" alt="TTWO stock price history chart" loading="lazy" decoding="async" className="w-full rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[{ label: 'From 52W Low', val: '+29.6%', color: 'text-emerald-400' }, { label: 'From ATH', val: '-8.3%', color: 'text-red-400' }, { label: '1-Month', val: `+${TTWO.monthChangePct}%`, color: 'text-emerald-400' }, { label: 'Avg Volume', val: '2.25M', color: 'text-white/60' }].map(s => (
                <div key={s.label} className="bg-white/[0.02] rounded-lg p-3 text-center">
                  <div className={`text-lg font-bold mono ${s.color}`}>{s.val}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sell the news warning */}
        <div className="mt-8 glass-card p-6 border-l-4 border-l-orange-500">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">The "Sell the News" Warning</h4>
              <p className="text-sm text-white/50 leading-relaxed">
                TTWO typically peaks 6–12 months before launch, then dips as the market digests already-priced-in sales figures.
                The real investor upside isn't launch week — it's the <span className="text-orange-400">recurring revenue tail</span> from GTA Online 2.0.
                Watch the first post-launch earnings call for <span className="text-orange-400">ARPU</span> and retention metrics at 30/60/90 days.
                That's where the story lives or dies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════
   IN-GAME ECONOMIC ENGINE
   ═══════════════════════════════════════════ */
function MissionCalculator() {
  const [payout, setPayout] = useState(100000);
  const [minutes, setMinutes] = useState(15);
  const [hourlyTarget, setHourlyTarget] = useState(500000);
  const perHour = Math.round((payout / minutes) * 60);
  const efficiency = Math.min(100, Math.round((perHour / hourlyTarget) * 100));

  return (
    <div className="glass-card-strong p-6">
      <h4 className="text-lg font-bold mb-1 flex items-center gap-2"><DollarSign className="w-5 h-5 text-orange-400" /> Mission ROI Calculator</h4>
      <p className="text-xs text-white/40 mb-5">Price your time. Every mission has an implicit hourly rate.</p>
      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-2"><span className="text-white/50">Mission Payout</span><span className="font-bold mono text-orange-400">${payout.toLocaleString()}</span></div>
          <Slider value={[payout]} onValueChange={v => setPayout(v[0])} min={10000} max={5000000} step={10000} className="[&_[role=slider]]:bg-orange-500" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2"><span className="text-white/50">Time (minutes)</span><span className="font-bold mono">{minutes}m</span></div>
          <Slider value={[minutes]} onValueChange={v => setMinutes(v[0])} min={1} max={120} step={1} className="[&_[role=slider]]:bg-orange-500" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2"><span className="text-white/50">Target $/Hour</span><span className="font-bold mono text-emerald-400">${hourlyTarget.toLocaleString()}/hr</span></div>
          <Slider value={[hourlyTarget]} onValueChange={v => setHourlyTarget(v[0])} min={50000} max={2000000} step={50000} className="[&_[role=slider]]:bg-emerald-500" />
        </div>
      </div>
      <div className="mt-6 bg-white/[0.02] rounded-lg p-4 border border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/50">Effective Hourly Rate</span>
          <span className={`text-2xl font-black mono ${perHour >= hourlyTarget ? 'text-emerald-400' : 'text-orange-400'}`}>${perHour.toLocaleString()}/hr</span>
        </div>
        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${perHour >= hourlyTarget ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, efficiency)}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-white/30">Efficiency vs Target</span>
          <span className={`text-[10px] font-bold ${perHour >= hourlyTarget ? 'text-emerald-400' : 'text-orange-400'}`}>{efficiency}%</span>
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <p className="text-xs text-white/40">
            {perHour >= hourlyTarget
              ? <span className="text-emerald-400 font-medium">Above target. Run this mission.</span>
              : <span className="text-orange-400 font-medium">Below target. Find a better loop or optimize your route.</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

function PropertyComparison() {
  const properties = [
    { name: 'Beachfront Safehouse', cost: 2500000, income: 15000, type: 'Passive', risk: 'Low', notes: 'Location appreciation + fast travel hub' },
    { name: 'Underground Warehouse', cost: 4200000, income: 35000, type: 'Semi-Passive', risk: 'Medium', notes: 'Supply chain business, requires resupply missions' },
    { name: 'Nightclub Front', cost: 1800000, income: 25000, type: 'Passive', risk: 'Low', notes: 'Combines with warehouse for stacking' },
    { name: 'Weapons Facility', cost: 3500000, income: 28000, type: 'Semi-Passive', risk: 'Medium', notes: 'High demand, attracts PvP attention' },
    { name: 'Executive Office', cost: 1000000, income: 8000, type: 'Passive', risk: 'Low', notes: 'Required for CEO missions, low ROI but essential' },
    { name: 'Hangar / Vehicle Bay', cost: 1500000, income: 12000, type: 'Semi-Passive', risk: 'Low', notes: 'Import/export operations, scalable with crew' },
  ];

  return (
    <div className="glass-card-strong p-6 overflow-x-auto">
      <h4 className="text-lg font-bold mb-1 flex items-center gap-2"><Landmark className="w-5 h-5 text-orange-400" /> Property Investment Matrix</h4>
      <p className="text-xs text-white/40 mb-5">Based on GTA Online economic models. VI will likely iterate on these mechanics.</p>
      <table className="w-full min-w-[600px]">
        <thead><tr className="text-left text-[10px] text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
          <th className="pb-3 font-medium">Property</th><th className="pb-3 font-medium">Cost</th><th className="pb-3 font-medium">$/Hour</th>
          <th className="pb-3 font-medium">ROI (Days)</th><th className="pb-3 font-medium">Type</th><th className="pb-3 font-medium">Risk</th><th className="pb-3 font-medium">Notes</th>
        </tr></thead>
        <tbody>{properties.map((p, i) => {
          const roi = Math.round(p.cost / (p.income * 24));
          return (
            <tr key={p.name} className={`border-b border-white/[0.04] ${i === properties.length - 1 ? 'border-b-0' : ''}`}>
              <td className="py-3 text-sm font-medium">{p.name}</td>
              <td className="py-3 text-sm mono">${p.cost.toLocaleString()}</td>
              <td className="py-3 text-sm mono text-emerald-400">${p.income.toLocaleString()}</td>
              <td className="py-3 text-sm mono">{roi}</td>
              <td className="py-3"><Badge className="text-[10px] bg-white/8 text-white/50">{p.type}</Badge></td>
              <td className="py-3"><Badge className={`text-[10px] ${p.risk === 'Low' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>{p.risk}</Badge></td>
              <td className="py-3 text-xs text-white/40">{p.notes}</td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}

function InGameEconomy() {
  const strategies = [
    { icon: Landmark, title: 'Property Arbitrage', priority: 'CRITICAL', desc: 'Limited-instance real estate appreciates fast. Beachfront safehouses and business hubs — buy early before the masses catch on.', color: 'red' },
    { icon: Briefcase, title: 'Supply Chain Dominance', priority: 'HIGH', desc: 'First players to own and max out passive businesses compound wealth exponentially. Think bunker → nightclub → warehouse stacking.', color: 'orange' },
    { icon: Eye, title: 'Information Arbitrage', priority: 'HIGH', desc: 'In the first 48 hours, YouTube is clickbait city. Real alpha lives in private Discord servers and grinding subreddits. Gatekeep yourself in now.', color: 'orange' },
    { icon: Wallet, title: 'Shark Card Discipline', priority: 'MEDIUM', desc: 'Early vehicles are bait — expensive but quickly outclassed. Spend first 20 hours pure grinding. Never buy cosmetics before income assets.', color: 'emerald' },
    { icon: Zap, title: 'First-Mover Window', priority: 'HIGH', desc: 'New businesses and content pay the most before the meta settles and the crowd piles in. Be early, document the optimal loop, and bank the premium while payouts are highest.', color: 'orange' },
    { icon: Users, title: 'Crew Economics', priority: 'MEDIUM', desc: '4 capitalist-minded players = lobby control, sales mission manipulation, exponential profit splitting. Find your board of directors now.', color: 'emerald' },
  ];

  const [econTab, setEconTab] = useState<'strategies' | 'calculator' | 'properties'>('strategies');

  return (
    <section id="economy" className="py-24 relative">
      <div className="absolute inset-0 opacity-12">
        <img src="/vault-wealth.jpg" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto section-padding reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <Gamepad2 className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">In-Game Strategy</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black mb-4">The <span className="text-gradient">Economic Engine</span></h2>
        <p className="text-white/40 max-w-2xl mb-10">GTA VI's online economy will be Rockstar's most sophisticated yet. The first 30 days separate the oligarchs from the tourists.</p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {[{ k: 'strategies', l: 'Strategy Cards' }, { k: 'calculator', l: 'ROI Calculator' }, { k: 'properties', l: 'Property Matrix' }].map(t => (
            <button key={t.k} onClick={() => setEconTab(t.k as any)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${econTab === t.k ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/8'}`}>{t.l}</button>
          ))}
        </div>

        {econTab === 'strategies' && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategies.map(s => (
                <div key={s.title} className="glass-card p-5 hover:bg-white/[0.04] transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg ${s.color === 'red' ? 'bg-red-500/10' : s.color === 'orange' ? 'bg-orange-500/10' : 'bg-emerald-500/10'} flex items-center justify-center`}>
                      <s.icon className={`w-5 h-5 ${s.color === 'red' ? 'text-red-400' : s.color === 'orange' ? 'text-orange-400' : 'text-emerald-400'}`} />
                    </div>
                    <Badge className={`text-[10px] ${s.color === 'red' ? 'bg-red-500/15 text-red-400' : s.color === 'orange' ? 'bg-orange-500/15 text-orange-400' : 'bg-emerald-500/15 text-emerald-400'} border-0`}>{s.priority}</Badge>
                  </div>
                  <h3 className="font-bold text-base mb-2">{s.title}</h3>
                  <p className="text-xs text-white/45 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-orange-400" /> The Psychological Edge</h3>
              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  { title: 'Assets Are Liabilities', desc: "Supercars lose value the moment you drive them off the lot. Your first $5M goes into income-generating assets, not looks." },
                  { title: 'Price Your Time', desc: 'If a mission pays 100k in 30 minutes, you earn 200k/hr. Quit low-paying activities fast. Time is non-renewable.' },
                  { title: "Don't Fall in Love", desc: 'Treat everything as a market position. The flex is being rich, not looking rich. Toys come after you own production.' },
                ].map(item => (
                  <div key={item.title} className="bg-white/[0.02] rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 text-orange-300">{item.title}</h4>
                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {econTab === 'calculator' && <MissionCalculator />}
        {econTab === 'properties' && <PropertyComparison />}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CONTENT MONETIZATION SUITE
   ═══════════════════════════════════════════ */
function ContentRevenueCalculator() {
  const [views, setViews] = useState(100000);
  const [cpm, setCpm] = useState(8);
  const [sponsors, setSponsors] = useState(2);
  const [affiliateRate, setAffiliateRate] = useState(5);

  const adRevenue = Math.round((views / 1000) * cpm);
  const sponsorRevenue = sponsors * 500;
  const affiliateRevenue = Math.round(views * 0.02 * affiliateRate);
  const total = adRevenue + sponsorRevenue + affiliateRevenue;

  return (
    <div className="glass-card-strong p-6">
      <h4 className="text-lg font-bold mb-1 flex items-center gap-2"><DollarSign className="w-5 h-5 text-orange-400" /> Content Revenue Estimator</h4>
      <p className="text-xs text-white/40 mb-5">Estimate earnings per video based on views, CPM, and monetization layers.</p>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="text-white/50">Monthly Views</span><span className="font-bold mono">{views.toLocaleString()}</span></div>
          <Slider value={[views]} onValueChange={v => setViews(v[0])} min={1000} max={10000000} step={1000} className="[&_[role=slider]]:bg-orange-500" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="text-white/50">CPM ($ per 1K views)</span><span className="font-bold mono">${cpm}</span></div>
          <Slider value={[cpm]} onValueChange={v => setCpm(v[0])} min={1} max={50} step={1} className="[&_[role=slider]]:bg-orange-500" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="text-white/50">Sponsored Videos/Month</span><span className="font-bold mono">{sponsors}</span></div>
          <Slider value={[sponsors]} onValueChange={v => setSponsors(v[0])} min={0} max={20} step={1} className="[&_[role=slider]]:bg-orange-500" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="text-white/50">Affiliate Commission %</span><span className="font-bold mono">{affiliateRate}%</span></div>
          <Slider value={[affiliateRate]} onValueChange={v => setAffiliateRate(v[0])} min={1} max={50} step={1} className="[&_[role=slider]]:bg-orange-500" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[10px] text-white/30">Ad Revenue</div><div className="text-lg font-bold mono text-emerald-400">${adRevenue.toLocaleString()}/mo</div></div>
        <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[10px] text-white/30">Sponsors</div><div className="text-lg font-bold mono text-orange-400">${sponsorRevenue.toLocaleString()}/mo</div></div>
        <div className="bg-white/[0.02] rounded-lg p-3"><div className="text-[10px] text-white/30">Affiliate</div><div className="text-lg font-bold mono text-amber-400">${affiliateRevenue.toLocaleString()}/mo</div></div>
        <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20"><div className="text-[10px] text-orange-400">Total Monthly</div><div className="text-xl font-black mono text-orange-400">${total.toLocaleString()}</div></div>
      </div>
    </div>
  );
}

function ContentSuite() {
  const lanes = [
    { icon: Video, title: 'Hyper-Specific Guides', effort: 'Medium', desc: '"How to unlock the best passive business in 5 hours" — solve the economic puzzle and package it. Search demand will be astronomical.', revenue: 'AdSense + Sponsorships' },
    { icon: BarChart3, title: 'Comparison & Analysis', effort: 'High', desc: "'GTA V vs VI economy: what Rockstar changed.' Positions you as an analyst. Higher CPMs on finance-adjacent content.", revenue: 'High CPM + Affiliates' },
    { icon: Radio, title: 'Shorts / Vertical Clips', effort: 'Low', desc: 'Funny physics fails, quick money tips, heartbreaking moments. TikTok and YouTube Shorts pull massive revenue at scale.', revenue: 'Volume Play + Brand Deals' },
    { icon: ShoppingCart, title: 'Data & Tools Products', effort: 'Medium', desc: 'Build the spreadsheet, route map, or price tracker the community keeps asking for and sell it. Zero marginal cost, compounding SEO, no ToS risk.', revenue: 'Digital Products' },
  ];

  const platforms = [
    { name: 'YouTube', cpm: '$6-15', bestFor: 'Long-form guides, deep analysis', algo: 'Search + Suggested', barrier: 'Medium' },
    { name: 'TikTok', cpm: '$0.5-3', bestFor: 'Short clips, viral moments', algo: 'For You Page', barrier: 'Low' },
    { name: 'Twitch', cpm: 'N/A', bestFor: 'Live gameplay, community building', algo: 'Categories + Raids', barrier: 'High' },
    { name: 'Twitter/X', cpm: '$2-8', bestFor: 'Quick tips, memes, news', algo: 'Algorithmic feed', barrier: 'Low' },
  ];

  return (
    <section id="content" className="py-24 relative">
      <div className="absolute inset-0 opacity-12">
        <img src="/content-empire.jpg" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto section-padding reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <Radio className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">Platform Capitalism</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black mb-4">Build Your <span className="text-gradient">Content Empire</span></h2>
        <p className="text-white/40 max-w-2xl mb-10">The greatest content opportunity in a decade. But "Let's Play" is dead air. Here's what actually wins.</p>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="space-y-4">
            {lanes.map(lane => (
              <div key={lane.title} className="glass-card p-5 hover:bg-white/[0.04] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <lane.icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{lane.title}</h3>
                      <Badge className="bg-white/8 text-white/40 text-[10px] mt-0.5">{lane.effort} Effort</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/40 mb-2 leading-relaxed">{lane.desc}</p>
                <div className="flex items-center gap-1.5 text-[10px]"><DollarSign className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400 font-medium">{lane.revenue}</span></div>
              </div>
            ))}
          </div>
          <ContentRevenueCalculator />
        </div>

        {/* Platform comparison */}
        <div className="glass-card-strong p-6 overflow-x-auto">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><Megaphone className="w-5 h-5 text-orange-400" /> Platform Comparison Matrix</h4>
          <table className="w-full min-w-[500px]">
            <thead><tr className="text-left text-[10px] text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
              <th className="pb-3 font-medium">Platform</th><th className="pb-3 font-medium">CPM Range</th><th className="pb-3 font-medium">Best For</th>
              <th className="pb-3 font-medium">Discovery</th><th className="pb-3 font-medium">Barrier</th>
            </tr></thead>
            <tbody>{platforms.map((p, i) => (
              <tr key={p.name} className={`border-b border-white/[0.04] ${i === platforms.length - 1 ? 'border-b-0' : ''}`}>
                <td className="py-3 font-bold text-sm">{p.name}</td>
                <td className="py-3 text-sm mono">{p.cpm}</td>
                <td className="py-3 text-xs text-white/40">{p.bestFor}</td>
                <td className="py-3 text-xs text-white/40">{p.algo}</td>
                <td className="py-3"><Badge className={`text-[10px] ${p.barrier === 'Low' ? 'bg-emerald-500/15 text-emerald-400' : p.barrier === 'Medium' ? 'bg-orange-500/15 text-orange-400' : 'bg-red-500/15 text-red-400'}`}>{p.barrier}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════
   REAL-WORLD ARBITRAGE
   ═══════════════════════════════════════════ */
function ArbitrageSection() {
  const [arbTab, setArbTab] = useState('affiliates');

  const affiliates = [
    { category: 'Gaming Hardware', program: 'Amazon Associates', commission: '1-10%', potential: '$500-5K/mo', notes: 'Link to consoles, GPUs, monitors in your content' },
    { category: 'Peripherals', program: 'Corsair / Logitech', commission: '5-15%', potential: '$200-2K/mo', notes: 'Higher rates than Amazon for direct brand partnerships' },
    { category: 'Energy Drinks', program: 'G Fuel / Monster', commission: '10-20%', potential: '$100-1K/mo', notes: 'Gaming audience converts exceptionally well' },
    { category: 'VPN / Software', program: 'NordVPN / ExpressVPN', commission: '$30-100/sale', potential: '$1K-10K/mo', notes: 'Highest CPA in gaming affiliate space' },
    { category: 'Game Keys', program: 'CDKeys / Green Man', commission: '2-5%', potential: '$300-3K/mo', notes: 'Direct relevance, high intent traffic' },
    { category: 'Streaming Gear', program: 'Elgato / Stream Deck', commission: '3-8%', potential: '$150-1.5K/mo', notes: 'Content creators buy gear compulsively' },
  ];

  const services = [
    { name: 'Coaching / Tutorials', setup: 'Low', effort: 'Medium', margin: '90%+', risk: 'Clean', desc: '1-on-1 sessions teaching economy optimization. $30-100/hr.' },
    { name: 'Custom Liveries & Designs', setup: 'Medium', effort: 'Medium', margin: '85-95%', risk: 'Clean', desc: 'Sell liveries, crew logos, and photo-mode edits. $5-50 each.' },
    { name: 'Paid Discord Community', setup: 'Low', effort: 'Medium', margin: '95%+', risk: 'Clean', desc: 'Membership with exclusive routes, early strats, and tools. $5-20/mo per member.' },
    { name: 'Clip Editing for Creators', setup: 'Low', effort: 'Medium', margin: '80-90%', risk: 'Clean', desc: 'Edit short-form clips for streamers who cannot keep up. $20-60 per clip.' },
    { name: 'Guide & Data Products', setup: 'Medium', effort: 'Low', margin: '90%+', risk: 'Clean', desc: 'Route maps, ROI spreadsheets, photo-mode presets. Zero marginal cost.' },
    { name: 'Tournament / Event Hosting', setup: 'Medium', effort: 'Medium', margin: '60-80%', risk: 'Clean', desc: 'Run races and challenges with entry fees + sponsor payouts. Build an audience you own.' },
  ];

  const merchandise = [
    { product: 'Crew/Clan Merch', platform: 'Teespring / Printful', margin: '30-50%', desc: 'T-shirts, hoodies with crew branding. Fans buy identity.' },
    { product: 'Digital Guides', platform: 'Gumroad / Patreon', margin: '90%+', desc: 'PDF guides, spreadsheets, route maps. Zero marginal cost.' },
    { product: 'Overlay Packs', platform: 'Etsy / Own Site', margin: '80%+', desc: 'Stream overlays, alerts, transitions for GTA content creators.' },
    { product: 'Preset Packs', platform: 'Gumroad', margin: '90%+', desc: 'Photo mode presets, video LUTs, editing templates.' },
  ];

  return (
    <section id="arbitrage" className="py-24 relative">
      <div className="absolute inset-0 opacity-12">
        <img src="/mobile-finance.jpg" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto section-padding reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <Swords className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">Real-World Arbitrage</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black mb-4">Monetize the <span className="text-gradient">Ecosystem</span></h2>
        <p className="text-white/40 max-w-2xl mb-10">No stock needed. The GTA VI economy creates real-world income streams for anyone sharp enough to build the infrastructure.</p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {[{ k: 'affiliates', l: 'Affiliate Programs' }, { k: 'services', l: 'Service Arbitrage' }, { k: 'merch', l: 'Digital Products' }].map(t => (
            <button key={t.k} onClick={() => setArbTab(t.k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${arbTab === t.k ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/8'}`}>{t.l}</button>
          ))}
        </div>

        {arbTab === 'affiliates' && (
          <div className="glass-card-strong p-6 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead><tr className="text-left text-[10px] text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
                <th className="pb-3 font-medium">Category</th><th className="pb-3 font-medium">Program</th><th className="pb-3 font-medium">Commission</th>
                <th className="pb-3 font-medium">Potential</th><th className="pb-3 font-medium">Notes</th>
              </tr></thead>
              <tbody>{affiliates.map((a, i) => (
                <tr key={a.category} className={`border-b border-white/[0.04] ${i === affiliates.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="py-3 text-sm font-medium">{a.category}</td>
                  <td className="py-3 text-xs text-white/50">{a.program}</td>
                  <td className="py-3 text-sm mono text-emerald-400">{a.commission}</td>
                  <td className="py-3 text-sm mono">{a.potential}</td>
                  <td className="py-3 text-xs text-white/40">{a.notes}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {arbTab === 'services' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <div key={s.name} className="glass-card p-5 hover:bg-white/[0.04] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm">{s.name}</h3>
                  <Badge className={`text-[10px] ${s.risk.includes('Clean') || s.risk.includes('None') ? 'bg-emerald-500/15 text-emerald-400' : s.risk.includes('Low') ? 'bg-orange-500/15 text-orange-400' : 'bg-red-500/15 text-red-400'}`}>{s.risk === 'Clean' ? 'ToS-safe' : s.risk}</Badge>
                </div>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">{s.desc}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/[0.02] rounded p-2"><div className="text-[9px] text-white/30">Setup</div><div className="text-xs font-semibold">{s.setup}</div></div>
                  <div className="bg-white/[0.02] rounded p-2"><div className="text-[9px] text-white/30">Effort</div><div className="text-xs font-semibold">{s.effort}</div></div>
                  <div className="bg-white/[0.02] rounded p-2"><div className="text-[9px] text-white/30">Margin</div><div className="text-xs font-semibold text-emerald-400">{s.margin}</div></div>
                </div>
              </div>
            ))}
            {/* Honest "what we don't touch" callout — turns a liability into a trust signal */}
            <div className="sm:col-span-2 lg:col-span-3 glass-card p-5 border-l-4 border-l-red-500/60">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1.5">What we don't touch — and why you shouldn't either</h4>
                  <p className="text-xs text-white/45 leading-relaxed">
                    Modded-account sales, real-money currency selling (RMT), and paid boosting all violate Take-Two's Terms of Service.
                    Beyond bans, they get your <span className="text-white/70">payment processor frozen</span>, your <span className="text-white/70">ad account and affiliate deals terminated</span>, and invite legal exposure — Take-Two has a long history of pursuing them.
                    The ToS-safe businesses above have a far higher ceiling because they can actually take sponsorships, ads, and card payments. Building trust <span className="text-emerald-400">is</span> the moat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {arbTab === 'merch' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {merchandise.map(m => (
              <div key={m.product} className="glass-card-strong p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{m.product}</h3>
                  <p className="text-xs text-white/40 mb-2">{m.desc}</p>
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-white/30">Platform: <span className="text-white/60">{m.platform}</span></span>
                    <span className="text-white/30">Margin: <span className="text-emerald-400">{m.margin}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monetization funnel */}
        <div className="mt-10 glass-card p-6">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" /> The Complete Monetization Funnel</h4>
          <div className="grid sm:grid-cols-5 gap-3">
            {[
              { step: '1', title: 'Traffic', desc: 'SEO content, Shorts, social posts drive visitors to your hub', color: 'bg-white/10' },
              { step: '2', title: 'Capture', desc: 'Email signup, Discord join, follow — own the relationship', color: 'bg-orange-500/15' },
              { step: '3', title: 'Trust', desc: 'Free guides, tools, and data establish authority', color: 'bg-orange-500/20' },
              { step: '4', title: 'Monetize', desc: 'Affiliate links, sponsored content, premium tools', color: 'bg-orange-500/25' },
              { step: '5', title: 'Scale', desc: 'Reinvest in content, hire help, expand to adjacent games', color: 'bg-orange-500/30' },
            ].map(f => (
              <div key={f.step} className={`${f.color} rounded-lg p-4 text-center border border-white/[0.06]`}>
                <div className="text-2xl font-black text-white/20 mb-1">{f.step}</div>
                <div className="text-sm font-bold mb-1">{f.title}</div>
                <div className="text-[10px] text-white/40 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CAPITALIST TOOLKIT
   ═══════════════════════════════════════════ */
function Toolkit() {
  const tools = [
    { icon: Download, title: 'GTA VI Launch Calendar', desc: 'All catalyst events mapped with risk weightings. Add to your calendar.', type: 'PDF', size: '2.4 MB' },
    { icon: BarChart3, title: 'Stock Comparison Matrix', desc: 'TTWO vs peripheral plays with entry/exit signals and position sizing.', type: 'Spreadsheet', size: '1.1 MB' },
    { icon: Gamepad2, title: 'In-Game Business Tracker', desc: 'Track your properties, income, and ROI across all businesses.', type: 'Spreadsheet', size: '850 KB' },
    { icon: Video, title: 'Content Planning Template', desc: '30-day content calendar optimized for GTA VI launch window.', type: 'Template', size: '3.2 MB' },
    { icon: DollarSign, title: 'Revenue Projection Model', desc: 'Model your content empire revenue across platforms and monetization layers.', type: 'Spreadsheet', size: '1.5 MB' },
    { icon: Shield, title: 'Risk Management Checklist', desc: 'Protect yourself from bans, scams, and platform algorithm changes.', type: 'PDF', size: '1.8 MB' },
  ];

  const quickTips = [
    { title: 'Day 1 Priority List', items: ['Create character ASAP', 'Complete tutorial for unlocks', 'Buy cheapest property with passive income', 'Join a crew before Day 2', 'Document everything for content'] },
    { title: 'Week 1 Checklist', items: ['Max out first passive business', 'Test all mission types for $/hour', 'Join 3+ grinding Discords', 'Publish first guide content', 'Set up affiliate links'] },
    { title: 'Month 1 Goals', items: ['Own 3+ income properties', 'Hit $10M in-game bank', 'Publish 10+ pieces of content', 'Build email list to 500+', 'First sponsored content deal'] },
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 opacity-10">
        <img src="/yacht-lifestyle.jpg" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto section-padding reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">Toolkit</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black mb-4">The <span className="text-gradient">Capitalist Toolkit</span></h2>
        <p className="text-white/40 max-w-2xl mb-10">Everything you need to execute. Download, customize, and deploy.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {tools.map(t => (
            <div
              key={t.title}
              onClick={() => toast.success(`${t.title}`, { description: 'Demo asset — wire this tile to your real file delivery.' })}
              className="glass-card p-5 hover:bg-white/[0.04] transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <t.icon className="w-5 h-5 text-orange-400" />
                </div>
                <Badge className="bg-white/8 text-white/40 text-[10px]">{t.type}</Badge>
              </div>
              <h3 className="font-bold text-sm mb-1 group-hover:text-orange-400 transition-colors">{t.title}</h3>
              <p className="text-xs text-white/35 mb-3 leading-relaxed">{t.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">{t.size}</span>
                <span className="text-[10px] text-orange-400 flex items-center gap-1">Download <Download className="w-3 h-3" /></span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick checklists */}
        <div className="grid lg:grid-cols-3 gap-5">
          {quickTips.map((tip) => (
            <div key={tip.title} className="glass-card-strong p-5">
              <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400" /> {tip.title}
              </h4>
              <ul className="space-y-2.5">
                {tip.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] text-white/40 font-mono">{i + 1}</span>
                    </div>
                    <span className="text-xs text-white/50 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   TIMELINE & RISK
   ═══════════════════════════════════════════ */
function TimelineRisk() {
  const events = [
    { date: 'Jun 25, 2026', title: 'Pre-Orders Live', desc: '$79.99 Standard / $99.99 Ultimate. Disc-less physical edition confirmed.', status: 'done', impact: 'HIGH' },
    { date: 'Late Jul–Aug 2026', title: 'Trailer 3 Expected', desc: 'The next trailer is projected for late July to mid-August — the biggest pre-launch search-volume spike.', status: 'upcoming', impact: 'HIGH' },
    { date: 'Aug 7, 2026', title: 'Q1 FY26 Earnings', desc: 'Take-Two reports before launch. Guidance and any GTA VI commentary move the stock.', status: 'upcoming', impact: 'HIGH' },
    { date: 'Sep 2026', title: 'Review Embargoes Lift', desc: 'Early access for major outlets. Metacritic scores will move TTWO.', status: 'upcoming', impact: 'MEDIUM' },
    { date: 'Nov 19, 2026', title: 'GTA VI Launch Day', desc: 'Biggest entertainment launch in history. Server stability is the question.', status: 'upcoming', impact: 'CRITICAL' },
    { date: 'Dec 2026', title: 'First Earnings Call', desc: 'Watch: sales figures, ARPU, Online player retention at 30 days.', status: 'upcoming', impact: 'HIGH' },
    { date: 'Q1 2027', title: 'Online Mode Launch', desc: 'GTA VI Online goes live. The real long-tail revenue engine begins.', status: 'upcoming', impact: 'CRITICAL' },
  ];

  const risks = [
    { title: 'Launch Delay', severity: 'HIGH', prob: '15%', desc: 'Any push past Nov 19 triggers sharp double-digit TTWO drop. Already delayed from Fall 2025.', hedge: 'Don\'t hold leveraged positions into October.' },
    { title: 'Server Meltdown', severity: 'MEDIUM', prob: '25%', desc: 'GTA V Online launch was a disaster. If VI repeats, retention and sentiment crater.', hedge: 'Monitor server status; content around "how to play despite queues".' },
    { title: 'Monetization Backlash', severity: 'MEDIUM', prob: '30%', desc: 'Too aggressive microtransactions = community backlash, review bombing.', hedge: 'Content positioning: "fair monetization analysis" wins trust.' },
    { title: 'Regulatory Risk', severity: 'LOW', prob: '10%', desc: 'EU loot box regulation and gaming monetization scrutiny.', hedge: 'Diversify across platforms and geographies.' },
    { title: 'Content Saturation', severity: 'MEDIUM', prob: '40%', desc: 'Millions of creators flood YouTube/TikTok. Standing out becomes expensive.', hedge: 'Niche down NOW. Own a specific angle before the rush.' },
  ];

  return (
    <section id="timeline" className="py-24 relative">
      <div className="absolute inset-0 opacity-10">
        <img src="/virtual-economy.jpg" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto section-padding reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <Timer className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-orange-400 uppercase tracking-widest">Launch Timeline</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black mb-4">Every <span className="text-gradient">Catalyst</span> Mapped</h2>
        <p className="text-white/40 max-w-2xl mb-10">The road to November is paved with tradable events. Here's your calendar of market-moving moments.</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Timeline */}
          <div className="glass-card-strong p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-400" /> Key Dates</h3>
            <div className="space-y-0">
              {events.map((e, i) => (
                <div key={e.title} className="flex gap-4 pb-6 relative">
                  {i < events.length - 1 && <div className="absolute left-[11px] top-7 bottom-0 w-px bg-white/[0.06]" />}
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${e.status === 'done' ? 'bg-emerald-500/20' : 'bg-orange-500/15'}`}>
                    {e.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-[10px] text-white/30 uppercase tracking-wider">{e.date}</div>
                      <Badge className={`text-[9px] ${e.impact === 'CRITICAL' ? 'bg-red-500/15 text-red-400' : e.impact === 'HIGH' ? 'bg-orange-500/15 text-orange-400' : 'bg-white/8 text-white/40'}`}>{e.impact}</Badge>
                    </div>
                    <h4 className="font-semibold text-sm mt-0.5">{e.title}</h4>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Radar */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Risk Radar</h3>
            <div className="space-y-4">
              {risks.map(r => (
                <div key={r.title} className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{r.title}</span>
                    <div className="flex gap-2">
                      <Badge className={`text-[9px] ${r.severity === 'HIGH' ? 'bg-red-500/15 text-red-400' : r.severity === 'MEDIUM' ? 'bg-orange-500/15 text-orange-400' : 'bg-white/8 text-white/40'}`}>{r.severity}</Badge>
                      <Badge className="text-[9px] bg-white/8 text-white/40">{r.prob} prob</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mb-2 leading-relaxed">{r.desc}</p>
                  <div className="flex items-start gap-1.5">
                    <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[10px] text-emerald-400/80">{r.hedge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="py-16 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">VICE<span className="text-orange-500">CAPITAL</span></span>
            </div>
            <p className="text-sm text-white/30 max-w-sm leading-relaxed">
              The definitive capital allocation guide for the GTA VI launch. Built for players who treat the game as a market, not a toy.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: 'The Map', href: '#map' },
                { label: 'Stock Intelligence', href: '#stocks' },
                { label: 'In-Game Economy', href: '#economy' },
                { label: 'Content Empire', href: '#content' },
                { label: 'Real-World Arbitrage', href: '#arbitrage' },
                { label: 'Timeline & Risk', href: '#timeline' },
              ].map(item => (
                <li key={item.href}><a href={item.href} className="text-sm text-white/30 hover:text-orange-400 transition-colors">{item.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Guides</h4>
            <ul className="space-y-2">
              {[
                { label: 'All guides', href: '/guides/' },
                { label: 'Release date & editions', href: '/guides/gta-6-release-date/' },
                { label: 'Invest in GTA 6 (TTWO)', href: '/guides/how-to-invest-in-gta-6-ttwo-stock/' },
                { label: 'Make money in GTA Online', href: '/guides/how-to-make-money-gta-6-online/' },
                { label: 'The map of Leonida', href: '/guides/gta-6-map-regions-leonida/' },
              ].map(item => (
                <li key={item.href}><a href={item.href} className="text-sm text-white/30 hover:text-orange-400 transition-colors">{item.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { label: 'About & methodology', href: '/about/' },
                { label: 'Disclaimer', href: '/legal/disclaimer/' },
                { label: 'Privacy policy', href: '/legal/privacy/' },
                { label: 'Terms of use', href: '/legal/terms/' },
              ].map(item => (
                <li key={item.href}><a href={item.href} className="text-sm text-white/30 hover:text-orange-400 transition-colors">{item.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/20">Not financial advice — informational and entertainment purposes only. Market data snapshot as of July 17, 2026.</p>
          <p className="text-[10px] text-white/20 mono">VICECAPITAL // GTA VI EDITION</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════ */
export default function App() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal-up').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <AnimatedBackdrop />
      <ScrollProgress />
      <div className="relative z-10 min-h-screen text-white selection:bg-orange-500/30">
        <Nav />
        <Hero />
        <ThesisDashboard />
        <RegionsSection />
        <StockHub />
        <InGameEconomy />
        <ContentSuite />
        <ArbitrageSection />
        <Toolkit />
        <TimelineRisk />
        <Footer />
      </div>
      <BackToTop />
      <Toaster position="bottom-center" theme="dark" richColors />
    </>
  );
}
