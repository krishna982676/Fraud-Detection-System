import React from 'react';
import { motion } from 'framer-motion';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center select-none">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-cyber-green/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute inset-10 bg-cyber-teal/10 rounded-full blur-2xl -z-10" />

      {/* Main Isometric Animated SVG */}
      <motion.svg
        viewBox="0 0 540 460"
        className="w-full h-auto drop-shadow-[0_20px_35px_rgba(0,255,156,0.18)]"
        initial={{ y: 0 }}
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="monGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0F1A13" />
            <stop offset="100%" stopColor="#050806" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A140F" />
            <stop offset="100%" stopColor="#020804" />
          </linearGradient>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00FF9C" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#14281E" />
            <stop offset="100%" stopColor="#0A160F" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Isometric Grid Floor Plane */}
        <g opacity="0.35" stroke="#1A3B29" strokeWidth="1">
          <line x1="270" y1="360" x2="490" y2="440" />
          <line x1="270" y1="360" x2="50" y2="440" />
          <line x1="270" y1="390" x2="440" y2="450" />
          <line x1="270" y1="390" x2="100" y2="450" />
          <ellipse cx="270" cy="410" rx="190" ry="40" fill="none" stroke="#00FF9C" strokeOpacity="0.2" />
        </g>

        {/* Monitor Base Pedestal */}
        <polygon points="230,370 310,370 330,410 210,410" fill="#0A140E" stroke="#1A2B20" strokeWidth="1.5" />
        <polygon points="255,310 285,310 290,370 250,370" fill="#0D1A13" stroke="#1A2B20" strokeWidth="1.5" />

        {/* Isometric Cyber Terminal Monitor Body */}
        <g transform="translate(60, 40)">
          {/* Bezel */}
          <rect x="30" y="30" width="360" height="240" rx="16" fill="url(#monGrad)" stroke="#1A2B20" strokeWidth="2" />
          {/* Neon inner edge */}
          <rect x="42" y="42" width="336" height="216" rx="10" fill="url(#screenGrad)" stroke="#00FF9C" strokeOpacity="0.3" strokeWidth="1" />

          {/* Monitor Screen Grid Lines */}
          <path d="M 42 100 L 378 100 M 42 160 L 378 160 M 42 210 L 378 210" stroke="#00FF9C" strokeOpacity="0.08" strokeDasharray="3 3" />
          <path d="M 120 42 L 120 258 M 210 42 L 210 258 M 300 42 L 300 258" stroke="#00FF9C" strokeOpacity="0.08" strokeDasharray="3 3" />

          {/* Header Bar inside monitor */}
          <rect x="44" y="44" width="332" height="24" fill="#0F1F17" />
          <circle cx="58" cy="56" r="3.5" fill="#FF3B5C" />
          <circle cx="70" cy="56" r="3.5" fill="#FFB020" />
          <circle cx="82" cy="56" r="3.5" fill="#00FF9C" />
          <text x="100" y="60" fill="#00FF9C" fontSize="10" fontFamily="JetBrains Mono" opacity="0.8">
            SENTINELX // INGESTION: 4,820 EPS
          </text>

          {/* Central Holographic Shield */}
          <g transform="translate(185, 110)" filter="url(#glow)">
            <path
              d="M 25 5 L 48 18 C 48 38 36 58 25 68 C 14 58 2 38 2 18 Z"
              fill="none"
              stroke="url(#shieldGrad)"
              strokeWidth="2.5"
            />
            {/* Center Checkmark */}
            <path d="M 15 32 L 22 40 L 36 24" fill="none" stroke="#00FF9C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Transaction Wave Graph under shield */}
          <path
            d="M 50 220 Q 90 170 140 210 T 230 180 T 320 220 T 370 190"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="2"
            opacity="0.85"
          />
          <path
            d="M 50 230 Q 110 200 170 235 T 260 210 T 370 230"
            fill="none"
            stroke="#00FF9C"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </g>

        {/* Floating Cyber Card 1 (Left - Approved Transaction) */}
        <g transform="translate(20, 160)">
          <rect x="0" y="0" width="130" height="64" rx="10" fill="url(#cardGrad)" stroke="#00FF9C" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="18" cy="20" r="5" fill="#00FF9C" />
          <text x="32" y="24" fill="#E6F5EC" fontSize="10" fontFamily="Space Grotesk" fontWeight="bold">TXN-4921</text>
          <text x="16" y="42" fill="#809988" fontSize="9" fontFamily="JetBrains Mono">$142.50 • GROCERY</text>
          <rect x="16" y="50" width="60" height="4" rx="2" fill="#00FF9C" fillOpacity="0.3" />
          <rect x="16" y="50" width="22" height="4" rx="2" fill="#00FF9C" />
        </g>

        {/* Floating Cyber Card 2 (Right - Threat Intercepted) */}
        <g transform="translate(390, 90)">
          <rect x="0" y="0" width="140" height="74" rx="10" fill="url(#cardGrad)" stroke="#FF3B5C" strokeOpacity="0.5" strokeWidth="1" />
          <circle cx="18" cy="22" r="5" fill="#FF3B5C" />
          <text x="32" y="26" fill="#FF3B5C" fontSize="10" fontFamily="Space Grotesk" fontWeight="bold">RISK: 98.4% [HIGH]</text>
          <text x="16" y="44" fill="#E6F5EC" fontSize="9" fontFamily="JetBrains Mono">Impossible Travel</text>
          <text x="16" y="58" fill="#809988" fontSize="8" fontFamily="JetBrains Mono">&gt; 3,200 km/h spike</text>
        </g>

        {/* Cyber Gear Accents (Original Vector) */}
        <g transform="translate(420, 290)" opacity="0.6" stroke="#00FF9C" strokeWidth="1.5" fill="none">
          <circle cx="20" cy="20" r="14" />
          <circle cx="20" cy="20" r="6" />
          <path d="M 20 2 L 20 6 M 20 34 L 20 38 M 2 20 L 6 20 M 34 20 L 38 20 M 7 7 L 10 10 M 30 30 L 33 33 M 7 33 L 10 30 M 30 7 L 33 10" />
        </g>
      </motion.svg>
    </div>
  );
};

