import React from 'react';
import { cn } from '../../lib/utils';

export interface ThreatGaugeProps {
  score: number; // 0.0 to 1.0 (or percentage 0 to 100)
  label?: string;
  sublabel?: string;
  size?: number;
  className?: string;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({
  score,
  label = 'SYSTEM THREAT LEVEL',
  sublabel,
  size = 200,
  className,
}) => {
  // Normalize score to 0..1
  const normScore = Math.max(0, Math.min(1, score > 1 ? score / 100 : score));
  const percentage = Math.round(normScore * 100);

  // SVG parameters for semicircle gauge
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half circle perimeter
  const strokeDashoffset = circumference - normScore * circumference;

  let threatColor = '#00FF9C';
  let threatText = 'DEFCON 5 // NOMINAL';
  if (normScore >= 0.7) {
    threatColor = '#FF3B5C';
    threatText = 'DEFCON 1 // CRITICAL';
  } else if (normScore >= 0.4) {
    threatColor = '#FFB020';
    threatText = 'DEFCON 3 // ELEVATED';
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-4 bg-surface border border-border rounded-xl', className)}>
      <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">
        {label}
      </div>

      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 10} className="overflow-visible">
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#14221A"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Gradient/Color Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={threatColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${threatColor}66)`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <span className="text-3xl font-bold font-mono text-white tabular-nums">
            {percentage}%
          </span>
          <span
            className="text-[11px] font-mono font-bold tracking-widest mt-0.5"
            style={{ color: threatColor }}
          >
            {threatText}
          </span>
        </div>
      </div>

      {sublabel && (
        <span className="text-xs text-text-muted font-mono mt-2 text-center">
          {sublabel}
        </span>
      )}
    </div>
  );
};

