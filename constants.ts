const isBrowser = typeof window !== 'undefined';
const isRunApp = isBrowser && window.location.origin.includes('.run.app');
const isLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Priority:
// 1. Env variable VITE_API_URL if specified
// 2. Relative path ('') if accessed on local dev or on Cloud Run directly
// 3. Fallback to the AI Studio preview environment URL
export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || (
  (isRunApp || isLocal) ? '' : 'https://ais-pre-ubzg6ohqwxfncnjxhzi3nj-16842427189.europe-west2.run.app'
);

