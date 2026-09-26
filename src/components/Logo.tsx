/**
 * @file Logo.tsx
 * @description Premium luxury branding logo component for Auto Spot Hub.
 * Renders the Auto Spot Hub site logo and title.
 */

import React from 'react';
import autoSpotHubLogo from '../assets/images/autospothub_logo_1785998867718.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 'w-8 h-8 sm:w-9 sm:h-9', title: 'text-sm sm:text-base', sub: 'hidden sm:flex text-[9px]' },
    md: { img: 'w-9 h-9 sm:w-11 sm:h-11', title: 'text-base sm:text-xl', sub: 'hidden sm:flex text-[10px]' },
    lg: { img: 'w-11 h-11 sm:w-14 sm:h-14', title: 'text-lg sm:text-2xl', sub: 'hidden sm:flex text-[11px]' },
    xl: { img: 'w-16 h-16 sm:w-20 sm:h-20', title: 'text-2xl sm:text-3xl', sub: 'hidden sm:flex text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex min-w-0 items-center gap-2 sm:gap-3 group ${className}`}>
      {/* Site logo badge */}
      <div className={`relative ${currentSize.img} rounded-xl overflow-hidden bg-slate-950 p-0.5 border border-amber-500/40 shadow-lg shadow-amber-500/20 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300 flex-shrink-0`}>
        <img
          src={autoSpotHubLogo}
          alt="Auto Spot Hub Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-yellow-300/10 pointer-events-none" />
      </div>

      {/* Brand Text Header */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`${currentSize.title} font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-amber-300 transition-all duration-300`}>
            AUTO SPOT HUB
          </span>
        </div>
        {showSubtitle && (
          <p className={`${currentSize.sub} text-amber-400/90 tracking-widest font-bold uppercase flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
            <span>LUXURY CAR SHOWROOM</span>
          </p>
        )}
      </div>
    </div>
  );
};
