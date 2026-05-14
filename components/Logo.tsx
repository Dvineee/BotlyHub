
import React from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className, style, onClick }) => {
  return (
    <div 
      className={`flex items-center gap-2 ${className}`} 
      style={style}
      onClick={onClick}
    >
      <div className="w-8 h-8 flex-shrink-0">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="rotate(204 24 25)">
            <path 
              d="M23.4365 26.5357L17.5199 39.224C16.1195 42.2273 12.5496 43.5266 9.54633 42.1262V42.1262C6.54309 40.7257 5.24376 37.1558 6.6442 34.1526L18.373 9" 
              fill="#30a9fe" 
              stroke="#FFF" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            <path 
              d="M41.3541 34.1527L29.5208 8.7761C28.1203 5.77286 24.5505 4.47352 21.5472 5.87396C18.544 7.27439 17.2447 10.8443 18.6451 13.8475L30.4784 39.2241C31.8788 42.2274 35.4487 43.5267 38.452 42.1263C41.4552 40.7258 42.7545 37.156 41.3541 34.1527Z" 
              fill="#30a9fe" 
              stroke="#FFF" 
              strokeWidth="4"
            />
            <circle 
              cx="25" 
              cy="38" 
              r="6" 
              fill="#30a9fe" 
              stroke="#FFF" 
              strokeWidth="4"
            />
          </g>
        </svg>
      </div>
      <span className="flex items-center text-2xl font-black tracking-[-0.08em] uppercase italic leading-none">
        <span className="text-slate-900 dark:text-white">BOTLY</span>
        <span className="text-blue-500 ml-0.5 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">HUB</span>
      </span>
    </div>
  );
};

export default Logo;
