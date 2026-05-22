const isRunApp = window.location.origin.includes('.run.app') || window.location.href.includes('.run.app');
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || !window.location.hostname;

// Priority:
// 1. Env variable VITE_API_URL if specified
// 2. Relative path ('') if accessed on local dev or on Cloud Run directly
// 3. Fallback to empty string for safe relative fetching
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

