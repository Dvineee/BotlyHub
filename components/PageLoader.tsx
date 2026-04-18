
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcf4ff] text-slate-900">
    <img src="/logo.svg" alt="Logo" style={{ width: '2.5em', height: 'auto' }} className="drop-shadow-[0_0_15px_rgba(34,158,217,0.2)]" />
    <span className="text-xs font-black uppercase tracking-[0.2em] mt-6 opacity-60 italic">Senkronize Ediliyor</span>
  </div>
);
