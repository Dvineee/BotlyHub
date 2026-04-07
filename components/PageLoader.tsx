
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
    <span className="text-xs font-medium uppercase tracking-widest font-black opacity-40">Senkronize Ediliyor</span>
  </div>
);
