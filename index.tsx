
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { TranslationProvider } from './TranslationContext';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// PRODUCTION UYARISI:
// Canlıya alırken bu URL'i kendi sunucunuzdaki 'tonconnect-manifest.json' dosyasının
// HTTPS adresi ile değiştirin. Aksi takdirde cüzdan bağlantıları çalışmayabilir.
// Örn: https://your-domain.com/tonconnect-manifest.json
const manifestUrl = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </TonConnectUIProvider>
  </React.StrictMode>
);
