
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.origin.includes('botlyhub.vercel.app') 
    ? 'https://ais-pre-ubzg6ohqwxfncnjxhzi3nj-16842427189.europe-west2.run.app' 
    : '');
