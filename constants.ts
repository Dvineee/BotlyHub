const isBrowser = typeof window !== 'undefined';
const isVercel = isBrowser && (
  (window?.location?.hostname && window.location.hostname.includes('vercel.app')) ||
  (window?.location?.href && window.location.href.includes('vercel.app'))
);

// Priority:
// 1. Env variable VITE_API_URL if specified
// 2. Relative path ('') if accessed on local dev, on Cloud Run directly, or custom domains
// 3. Fallback to the AI Studio preview environment URL only when hosted on Vercel
export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || (
  isVercel ? 'https://ais-pre-ubzg6ohqwxfncnjxhzi3nj-16842427189.europe-west2.run.app' : ''
);

