const isRunApp = window.location.origin.includes('.run.app');
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = (isRunApp || isLocal) 
  ? '' 
  : 'https://botlyhub.onrender.com';
