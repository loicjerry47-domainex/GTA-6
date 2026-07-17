/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional JSON quote endpoint: returns { price:number, changePct?:number, updatedAt?:string }. */
  readonly VITE_QUOTE_ENDPOINT?: string;
  /** Optional POST endpoint for email/alert signups (Formspree, Buttondown, your own function). */
  readonly VITE_SUBSCRIBE_ENDPOINT?: string;
  /** Absolute site URL (e.g. https://gta-6.vercel.app) used for Open Graph image URLs. */
  readonly VITE_SITE_URL?: string;
  /** Analytics domain (e.g. Plausible). When unset, no analytics script loads. */
  readonly VITE_ANALYTICS_DOMAIN?: string;
  /** Analytics script src; defaults to Plausible if a domain is set. */
  readonly VITE_ANALYTICS_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
