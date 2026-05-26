const isBrowser = typeof window !== 'undefined';

// Priority:
// 1. Env variable VITE_API_URL if specified
// 2. Relative path ('') for same-origin backend (Vercel, Cloud Run, Local Dev, preview iframe)
export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '';

