
import React from 'react';
import { useTheme } from '../ThemeContext';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ className, style }) => {
  const { theme } = useTheme();

  // Color logic based on theme
  const strokeColor = '#000000';
  const whitePathFill = '#FFFFFF';
  const blueFill = '#2F88FF';

  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <g transform="rotate(204 24 25)">
        {/* Bottom Path */}
        <path 
          d="M23.4365 26.5357L17.5199 39.224C16.1195 42.2273 12.5496 43.5266 9.54633 42.1262V42.1262C6.54309 40.7257 5.24376 37.1558 6.6442 34.1526L18.373 9" 
          fill={whitePathFill} 
          stroke={strokeColor} 
          strokeWidth="4" 
          strokeLinecap="round"
        />

        {/* Top/Mavi Path */}
        <path 
          d="M41.3541 34.1527L29.5208 8.7761C28.1203 5.77286 24.5505 4.47352 21.5472 5.87396C18.544 7.27439 17.2447 10.8443 18.6451 13.8475L30.4784 39.2241C31.8788 42.2274 35.4487 43.5267 38.452 42.1263C41.4552 40.7258 42.7545 37.156 41.3541 34.1527Z" 
          fill={blueFill} 
          stroke={strokeColor} 
          strokeWidth="4"
        />

        {/* Circle */}
        <circle 
          cx="25" 
          cy="38" 
          r="6" 
          fill={blueFill} 
          stroke={strokeColor} 
          strokeWidth="4"
        />
      </g>
    </svg>
  );
};

export default Logo;
