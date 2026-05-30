
import React from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  isIcon?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, style, onClick, isIcon }) => {
  const iconContent = (
    <div className={`${isIcon ? 'w-full h-full' : 'w-9 h-9 md:w-10 md:h-10'} flex-shrink-0 transition-transform duration-300 hover:scale-105`}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 60 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          .logo-plate-path {
            fill: #000000;
            transition: fill 0.3s ease;
          }
          .logo-stroke-path {
            fill: #000000;
            transition: fill 0.3s ease;
          }
          .dark .logo-plate-path {
            fill: #ffffff;
          }
          .dark .logo-stroke-path {
            fill: #ffffff;
          }
        `}</style>

        <defs>
          <mask id="linear-cuts">
            {/* Her şeyi beyaza boya (görünür kıl) */}
            <rect x="0" y="0" width="60" height="60" fill="#ffffff" />
            {/* Soldan giren ve ortada biten 3 kalın kesici çizgi (siyah alanlar logoyu siler/keser) */}
            <g stroke="#000000" strokeWidth="3.5" strokeLinecap="round">
              <line x1="-5" y1="22" x2="30" y2="22" />
              <line x1="-5" y1="28" x2="35" y2="28" />
              <line x1="-5" y1="34" x2="30" y2="34" />
            </g>
          </mask>
        </defs>

        {/* LOGO GÖVDESİ: Tam ortalanmış ve kesik maskesi uygulanmış ana plaka */}
        <g mask="url(#linear-cuts)" transform="translate(0, 4)">
          <path 
            d="M33.638,9.147,50.362,20.853A3.844,3.844,0,0,1,52,24a3.844,3.844,0,0,1-1.638,3.147L33.638,38.853A6.338,6.338,0,0,1,30,40a6.338,6.338,0,0,1-3.638-1.147L9.638,27.147A3.844,3.844,0,0,1,8,24a3.844,3.844,0,0,1,1.638-3.147L26.362,9.147A6.338,6.338,0,0,1,30,8A6.338,6.338,0,0,1,33.638,9.147Z" 
            className="logo-plate-path"
          />
          <path 
            d="M30,41.5a7.818,7.818,0,0,1-4.5-1.417L8.778,28.375a5.34,5.34,0,0,1,0-8.75L25.5,7.918a7.972,7.972,0,0,1,9,0h0L51.222,19.625a5.34,5.34,0,0,1,0,8.75L34.5,40.082A7.811,7.811,0,0,1,30,41.5Zm0-32a4.825,4.825,0,0,0-2.779.876L10.5,22.082a2.341,2.341,0,0,0,0,3.836L27.222,37.625a4.921,4.921,0,0,0,5.557,0L49.5,25.918a2.341,2.341,0,0,0,0-3.836L32.779,10.376A4.825,4.825,0,0,0,30,9.5Z" 
            className="logo-stroke-path"
          />
        </g>
      </svg>
    </div>
  );

  if (isIcon) {
    return (
      <div className={className} style={style} onClick={onClick}>
        {iconContent}
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-2.5 ${className}`} 
      style={style}
      onClick={onClick}
    >
      {iconContent}
      <span className="flex items-center text-2xl md:text-3xl font-black tracking-[-0.08em] uppercase italic leading-none select-none">
        <span className="text-slate-900 dark:text-white transition-colors duration-300">BOTLY</span>
        <span className="text-blue-500 ml-0.5 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] select-none">HUB</span>
      </span>
    </div>
  );
};

export default Logo;
