
const isRunApp = window.location.origin.includes('.run.app');
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = (isRunApp || isLocal) 
  ? '' 
  : 'https://ais-pre-ubzg6ohqwxfncnjxhzi3nj-16842427189.europe-west2.run.app';
