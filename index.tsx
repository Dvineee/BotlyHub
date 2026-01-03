
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { TranslationProvider } from './TranslationContext';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './index.css';

/**
 * Uygulama Hata Yakalayıcı (ErrorBoundary)
 * Beklenmedik uygulama hatalarını yakalar ve kullanıcıya güvenli bir geri dönüş sunar.
 */
interface ErrorBoundaryProps { 
  children?: ReactNode;
}
interface ErrorBoundaryState { 
  hasError: boolean; 
  error: Error | null; 
}

// Fix: Use React.Component specifically to ensure that the TypeScript compiler correctly identifies the inheritance chain 
// and makes the inherited 'props' and 'state' properties available on the instance.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declaring and initializing state as a class property for better TypeScript support.
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Runtime Error:", error, errorInfo);
  }

  render() {
    // Fix: Accessing 'this.state' which is inherited from the base React.Component class.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">Uygulama Hatası</h2>
          <p className="text-slate-500 text-sm mb-8 max-w-xs font-medium">Bir şeyler ters gitti. Uygulamayı yeniden başlatmayı deneyin.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-95 text-xs uppercase tracking-widest"
          >
            Yeniden Başlat
          </button>
        </div>
      );
    }
    
    // Fix: Accessing 'this.props' which is inherited from the base React.Component class.
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const manifestUrl = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';
  const root = createRoot(rootElement);

  // Fix: Rendering the app wrapped in the fixed ErrorBoundary and global providers.
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          <TranslationProvider>
            <App />
          </TranslationProvider>
        </TonConnectUIProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
