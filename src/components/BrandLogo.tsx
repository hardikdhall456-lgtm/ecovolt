import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-base',
    md: 'w-10 h-10 rounded-xl text-xl',
    lg: 'w-14 h-14 rounded-2xl text-2xl',
  }[size];

  return (
    <div
      className={`${sizeClasses} bg-gradient-to-tr from-emerald-700 via-emerald-500 to-teal-300 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 select-none relative overflow-hidden`}
      aria-label="EcoVolt E Logo"
    >
      <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15 pointer-events-none" />
      <svg
        viewBox="0 0 64 64"
        className="w-[62%] h-[62%] relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 12H48V21.5H27V27.25H44.5V36.75H27V42.5H49V52H16V12Z"
          fill="#060A12"
        />
      </svg>
    </div>
  );
};
