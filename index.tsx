
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
  children: ReactNode; 
}
interface ErrorBoundaryState { 
  hasError: boolean; 
  error: Error | null; 
}

// Fixed: Inherit from React.Component with explicit generic types to ensure 'this.state' and 'this.props' are correctly typed and available to the TypeScript compiler.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Runtime Error:", error, errorInfo);
  }

  render() {
    // Fixed: Properly access state via 'this.state' which is now correctly inherited from React.Component.
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
    // Fixed: Properly return children from props using 'this.props.children'.
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const manifestUrl = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';
  const root = createRoot(rootElement);

  // Fixed: Wrapped the app tree within ErrorBoundary, which now correctly identifies its children through proper class inheritance.
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
