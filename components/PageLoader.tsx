
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcf4ff] text-slate-900">
    <svg width="120px" height="120px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="" transform="rotate(204 24 25)">
          <path
            d="M41.3541 34.1527L29.5208 8.7761C28.1203 5.77286 24.5505 4.47352 21.5472 5.87396C18.544 7.27439 17.2447 10.8443 18.6451 13.8475L30.4784 39.2241C31.8788 42.2274 35.4487 43.5267 38.452 42.1263C41.4552 40.7258 42.7545 37.156 41.3541 34.1527Z"
            fill="#2F88FF"
            stroke="#000000"
            strokeWidth="4"
            strokeDasharray="200"
            strokeDashoffset="200"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="200"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M23.4365 26.5357L17.5199 39.224C16.1195 42.2273 12.5496 43.5266 9.54633 42.1262V42.1262C6.54309 40.7257 5.24376 37.1558 6.6442 34.1526L18.373 9"
            stroke="#000000"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="120"
            strokeDashoffset="120"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="120"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          <circle
            cx="25"
            cy="38"
            r="6"
            fill="#2F88FF"
            stroke="#000000"
            strokeWidth="4"
          >
            <animate
              attributeName="r"
              values="5.5;6.5;5.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
        <defs>
          <clipPath id="clip0">
            <rect width="50" height="50" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    <span className="text-xs font-black uppercase tracking-[0.2em] mt-6 opacity-60 italic">Senkronize Ediliyor</span>
  </div>
);
