import React from 'react';

interface GpxPhotosLogoProps {
  variant?: 'full' | 'emblem' | 'horizontal';
  theme?: 'dark' | 'light';
  className?: string;
  size?: number; // base height in px
}

export const GpxPhotosLogo: React.FC<GpxPhotosLogoProps> = ({
  variant = 'horizontal',
  theme = 'dark',
  className = '',
  size = 32,
}) => {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#0B2B64';

  if (variant === 'emblem') {
    return (
      <svg
        viewBox="0 0 500 380"
        fill="none"
        style={{ height: size, width: 'auto' }}
        className={`inline-block shrink-0 ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gpxSky1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#008CE8" />
            <stop offset="60%" stopColor="#21A1F5" />
            <stop offset="100%" stopColor="#5CC2FF" />
          </linearGradient>
          <linearGradient id="gpxLake1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#007ECC" />
            <stop offset="100%" stopColor="#005B9E" />
          </linearGradient>
          <clipPath id="gpxCardClip1">
            <rect x="0" y="0" width="310" height="210" rx="20" ry="20" />
          </clipPath>
          <filter id="gpxCardShadow1" x="-15%" y="-15%" width="135%" height="135%">
            <feDropShadow dx="2" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Back Card */}
        <g transform="translate(195, 175) rotate(-16) translate(-155, -105)">
          <rect x="0" y="0" width="300" height="205" rx="28" ry="28" fill="#005BB5" />
        </g>

        {/* Front Photo Card */}
        <g transform="translate(260, 185) rotate(-8) translate(-165, -115)" filter="url(#gpxCardShadow1)">
          <rect x="-10" y="-10" width="330" height="230" rx="28" ry="28" fill="#FFFFFF" />
          <g clipPath="url(#gpxCardClip1)">
            <rect x="0" y="0" width="310" height="210" fill="url(#gpxSky1)" />
            <ellipse cx="60" cy="85" rx="42" ry="22" fill="#FFFFFF" opacity="0.82" />
            <ellipse cx="90" cy="78" rx="35" ry="20" fill="#FFFFFF" opacity="0.92" />
            <ellipse cx="205" cy="80" rx="55" ry="24" fill="#FFFFFF" opacity="0.75" />
            <ellipse cx="245" cy="74" rx="42" ry="20" fill="#FFFFFF" opacity="0.85" />
            <path d="M-20,170 L50,110 L105,145 L155,95 L225,145 L290,105 L340,150 L340,220 L-20,220 Z" fill="#2B77BD" />
            <path d="M170,160 L245,95 L330,155 L330,220 L170,220 Z" fill="#1C5E9E" />
            <path d="M50,185 L145,55 L165,165 L50,185 Z" fill="#103D70" />
            <path d="M145,55 L225,175 L165,165 Z" fill="#1E5C9E" />
            <path d="M145,55 L132,74 L145,80 L140,88 L149,82 L158,89 L162,75 Z" fill="#FFFFFF" />
            <path d="M145,55 L158,89 L168,78 Z" fill="#A6DBFF" opacity="0.8" />
            <rect x="0" y="152" width="310" height="42" fill="url(#gpxLake1)" />
            <path d="M-10,210 L-10,150 L8,162 L8,140 L24,158 L24,135 L40,155 L58,175 L70,210 Z" fill="#081E38" />
            <path d="M230,210 L250,165 L270,178 L285,155 L300,170 L320,148 L320,210 Z" fill="#081E38" />

            {/* Orange Route */}
            <path
              d="M48,168 Q75,150 98,125 T145,142 T162,95 T222,68"
              fill="none"
              stroke="#FF5500"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="48" cy="168" r="9.5" fill="#FF5500" />
            <circle cx="48" cy="168" r="4.5" fill="#FFFFFF" />
            <circle cx="98" cy="125" r="8.5" fill="#FF5500" />
            <circle cx="98" cy="125" r="4" fill="#FFFFFF" />
            <circle cx="145" cy="142" r="8.5" fill="#FF5500" />
            <circle cx="145" cy="142" r="4" fill="#FFFFFF" />
            <circle cx="162" cy="95" r="8.5" fill="#FF5500" />
            <circle cx="162" cy="95" r="4" fill="#FFFFFF" />

            {/* Summit Pin */}
            <g transform="translate(222, 68)">
              <path
                d="M0,0 C-10,-14 -18,-24 -18,-38 C-18,-52 -5,-62 0,-62 C5,-62 18,-52 18,-38 C18,-24 10,-14 0,0 Z"
                fill="#FF5500"
              />
              <circle cx="0" cy="-38" r="7.5" fill="#FFFFFF" />
            </g>
          </g>
        </g>
      </svg>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <GpxPhotosLogo variant="emblem" size={size * 1.6} />
        <div className="flex items-center -mt-2">
          <span className="font-extrabold tracking-tight" style={{ color: textColor, fontSize: size * 0.7 }}>
            gpx
          </span>
          <span
            className="rounded-full bg-[#FF5500] inline-block mx-1"
            style={{ width: size * 0.18, height: size * 0.18 }}
          />
          <span className="font-extrabold tracking-tight" style={{ color: textColor, fontSize: size * 0.7 }}>
            photos
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Lockup (Emblem on left, "gpx.photos" on right)
  return (
    <div className={`inline-flex items-center gap-2 select-none group cursor-pointer ${className}`}>
      <GpxPhotosLogo variant="emblem" size={size} />
      <div className="flex items-center leading-none">
        <span
          className="font-black tracking-tight"
          style={{
            color: textColor,
            fontSize: size * 0.65,
            fontFamily: "system-ui, -apple-system, 'Plus Jakarta Sans', sans-serif",
          }}
        >
          gpx
        </span>
        <span
          className="rounded-full bg-[#FF5500] inline-block mx-0.5 shadow-sm"
          style={{ width: size * 0.16, height: size * 0.16 }}
        />
        <span
          className="font-black tracking-tight"
          style={{
            color: textColor,
            fontSize: size * 0.65,
            fontFamily: "system-ui, -apple-system, 'Plus Jakarta Sans', sans-serif",
          }}
        >
          photos
        </span>
      </div>
    </div>
  );
};
