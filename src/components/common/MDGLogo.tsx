import React from 'react';

interface MDGLogoProps {
  variant?: 'full' | 'compact' | 'icon-only' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const MDGLogo: React.FC<MDGLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  const iconSizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const isLight = variant === 'light';

  const iconElement = (
    <div className={`relative shrink-0 ${iconSizeMap[size]}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="mdgDarkGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="60%" stopColor="#047857" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="mdgLeaf" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="40%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
        </defs>

        {/* Shield background */}
        <rect x="0" y="0" width="120" height="120" rx="26" fill="url(#mdgDarkGreen)" />
        <rect x="3" y="3" width="114" height="114" rx="23" stroke="#34D399" strokeOpacity="0.4" strokeWidth="2" />

        {/* Towers */}
        <rect x="22" y="52" width="22" height="48" rx="3" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="47" y="32" width="26" height="68" rx="4" fill="#FFFFFF" />
        <rect x="76" y="44" width="22" height="56" rx="3" fill="#E2E8F0" fillOpacity="0.9" />

        {/* Windows - Tower Left */}
        <rect x="26" y="58" width="5" height="5" rx="1" fill="#047857" />
        <rect x="35" y="58" width="5" height="5" rx="1" fill="#047857" />
        <rect x="26" y="68" width="5" height="5" rx="1" fill="#047857" />
        <rect x="35" y="68" width="5" height="5" rx="1" fill="#047857" />
        <rect x="26" y="78" width="5" height="5" rx="1" fill="#047857" />
        <rect x="35" y="78" width="5" height="5" rx="1" fill="#047857" />
        <rect x="26" y="88" width="5" height="5" rx="1" fill="#047857" />
        <rect x="35" y="88" width="5" height="5" rx="1" fill="#047857" />

        {/* Windows - Tower Center */}
        <rect x="52" y="40" width="6" height="5" rx="1" fill="#065F46" />
        <rect x="62" y="40" width="6" height="5" rx="1" fill="#065F46" />
        <rect x="52" y="50" width="6" height="5" rx="1" fill="#065F46" />
        <rect x="62" y="50" width="6" height="5" rx="1" fill="#065F46" />
        <rect x="52" y="60" width="6" height="5" rx="1" fill="#065F46" />
        <rect x="62" y="60" width="6" height="5" rx="1" fill="#065F46" />
        <rect x="52" y="70" width="6" height="5" rx="1" fill="#065F46" />
        <rect x="62" y="70" width="6" height="5" rx="1" fill="#065F46" />
        <rect x="52" y="80" width="6" height="5" rx="1" fill="#065F46" />
        <rect x="62" y="80" width="6" height="5" rx="1" fill="#065F46" />
        <path d="M56 94 H64 V100 H56 Z" fill="#064E3B" />

        {/* Windows - Tower Right */}
        <rect x="80" y="50" width="5" height="5" rx="1" fill="#047857" />
        <rect x="89" y="50" width="5" height="5" rx="1" fill="#047857" />
        <rect x="80" y="60" width="5" height="5" rx="1" fill="#047857" />
        <rect x="89" y="60" width="5" height="5" rx="1" fill="#047857" />
        <rect x="80" y="70" width="5" height="5" rx="1" fill="#047857" />
        <rect x="89" y="70" width="5" height="5" rx="1" fill="#047857" />
        <rect x="80" y="80" width="5" height="5" rx="1" fill="#047857" />
        <rect x="89" y="80" width="5" height="5" rx="1" fill="#047857" />

        {/* Green Leaf Curving Up */}
        <path
          d="M18 100 C 35 102, 65 96, 85 75 C 95 65, 102 48, 104 28 C 88 32, 65 48, 52 66 C 40 82, 28 92, 18 100 Z"
          fill="url(#mdgLeaf)"
        />
        <path
          d="M22 98 C 45 92, 70 75, 100 32"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{iconElement}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {iconElement}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-tight ${
              isLight ? 'text-white' : 'text-emerald-950 dark:text-emerald-50'
            } ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-2xl' : 'text-3xl'}`}
          >
            MDG
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        {showSubtitle && (
          <span
            className={`font-bold tracking-wider uppercase text-[10px] ${
              isLight ? 'text-emerald-300' : 'text-emerald-700'
            }`}
          >
            Society Management System
          </span>
        )}
      </div>
    </div>
  );
};
