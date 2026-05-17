import './polyfills';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { TranslationProvider, useTranslation } from './TranslationContext';
import { ThemeProvider } from './ThemeContext';
import { FilterProvider } from './FilterContext';
import { HashRouter } from 'react-router-dom';
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

// Fix: Using React.Component with explicit generic types to ensure that inherited members like 'props' and 'state' are correctly identified by the compiler.
const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  
  return (
    <ErrorBoundary t={t}>
      {children}
    </ErrorBoundary>
  );
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps & { t: (key: string) => string }, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps & { t: (key: string) => string }) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Runtime Error:", error, errorInfo);
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">{t('error_boundary_title')}</h2>
          <p className="text-slate-500 text-sm mb-4 max-w-xs font-medium">{t('error_boundary_desc')}</p>
          {this.state.error && (
            <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-4 mb-8 max-w-xs w-full">
              <p className="text-red-400 text-[10px] font-mono break-all">{this.state.error.toString()}</p>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all   active:scale-95 text-xs uppercase tracking-widest"
          >
            {t('error_boundary_reboot')}
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, "") : "";
  const manifestUrl = `${currentOrigin}/tonconnect-manifest.json`;
  const root = createRoot(rootElement);

  root.render(
    <HelmetProvider>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <ThemeProvider>
          <TranslationProvider>
            <FilterProvider>
              <HashRouter>
                <ErrorBoundaryWrapper>
                  <App />
                </ErrorBoundaryWrapper>
              </HashRouter>
            </FilterProvider>
          </TranslationProvider>
        </ThemeProvider>
      </TonConnectUIProvider>
    </HelmetProvider>
  );
}
