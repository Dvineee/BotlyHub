
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcf4ff] text-slate-900">
    <svg width="100" height="100" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(26 150 150) scale(1.1)">
        <line x1="150" y1="105" x2="95" y2="195" stroke="#229ED9" strokeWidth="42" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="300">
          <animate attributeName="stroke-dashoffset" values="300;0;0;300" dur="2.4s" begin="0s" repeatCount="indefinite"/>
        </line>
        <line x1="150" y1="105" x2="205" y2="195" stroke="#FF8A3D" strokeWidth="42" strokeLinecap="round" strokeDasharray="300" strokeDashoffset="300">
          <animate attributeName="stroke-dashoffset" values="300;300;0;0;300" dur="2.4s" begin="0s" repeatCount="indefinite"/>
        </line>
        <line x1="95" y1="195" x2="150" y2="105" stroke="#22C55E" strokeWidth="42" strokeLinecap="round" strokeOpacity="0.7" strokeDasharray="300" strokeDashoffset="300">
          <animate attributeName="stroke-dashoffset" values="300;300;300;0;0;300" dur="2.4s" begin="0s" repeatCount="indefinite"/>
        </line>
        <circle cx="150" cy="103" r="12" fill="#229ED9">
          <animate attributeName="r" values="12;15;12" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="205" cy="195" r="12" fill="#FF8A3D"/>
      </g>
    </svg>
    <span className="text-xs font-black uppercase tracking-[0.2em] mt-6 opacity-60 italic">Senkronize Ediliyor</span>
  </div>
);
