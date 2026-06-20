const isBrowser = typeof window !== 'undefined';

// Priority:
// 1. Env variable VITE_API_URL if specified and not empty
// 2. Current origin (location.origin) in browser to prevent resolution errors
// 3. Fallback to empty string
const envApiUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL;
export const API_BASE_URL = (envApiUrl && envApiUrl !== 'undefined') 
  ? envApiUrl 
  : (isBrowser ? window.location.origin : '');

const envSiteUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) || (typeof process !== 'undefined' && process.env && (process.env.VITE_SITE_URL || process.env.SITE_URL));
export const SITE_URL = (envSiteUrl && envSiteUrl !== 'undefined')
  ? envSiteUrl
  : 'https://botlyhub.vercel.app';


