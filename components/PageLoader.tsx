
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcf4ff] text-slate-900">
    <svg width="100" height="100" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(26 150 150)">
        <polygon points="150,85 225,195 75,195" fill="#229ED9" opacity="0.9"/>
        <line x1="150" y1="85" x2="225" y2="195" stroke="#FF8A3D" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
        <line x1="75" y1="195" x2="150" y2="85" stroke="#22C55E" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
        <line x1="225" y1="195" x2="75" y2="195" stroke="#229ED9" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
      </g>
    </svg>
    <span className="text-xs font-black uppercase tracking-[0.2em] mt-6 opacity-60 italic">Senkronize Ediliyor</span>
  </div>
);
