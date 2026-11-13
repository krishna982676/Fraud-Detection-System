import React from 'react';
import { Globe } from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';

const CITY_COORDS: Record<string, { x: number; y: number; name: string }> = {
  NEW_YORK: { x: 120, y: 75, name: 'New York' },
  LONDON: { x: 235, y: 55, name: 'London' },
  PARIS: { x: 245, y: 65, name: 'Paris' },
  BERLIN: { x: 260, y: 58, name: 'Berlin' },
  DUBAI: { x: 310, y: 95, name: 'Dubai' },
  NEW_DELHI: { x: 344, y: 96, name: 'New Delhi' },
  MUMBAI: { x: 336, y: 112, name: 'Mumbai' },
  BENGALURU: { x: 342, y: 126, name: 'Bengaluru' },
  SINGAPORE: { x: 380, y: 135, name: 'Singapore' },
  TOKYO: { x: 420, y: 80, name: 'Tokyo' },
  SYDNEY: { x: 430, y: 175, name: 'Sydney' },
  TORONTO: { x: 115, y: 68, name: 'Toronto' },
};

function normalizeCityKey(loc?: string): string {
  if (!loc) return '';
  const raw = loc.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (raw === 'DELHI' || raw === 'INDIA' || raw === 'NEW_DELHI') return 'NEW_DELHI';
  if (raw === 'BANGALORE' || raw === 'BENGALURU') return 'BENGALURU';
  if (raw === 'BOMBAY' || raw === 'MUMBAI') return 'MUMBAI';
  return raw;
}

export const CityHeatMap: React.FC = () => {
  const { transactions } = useTransactionStore();

  const cityCounts: Record<string, { total: number; fraud: number }> = {};
  Object.keys(CITY_COORDS).forEach((c) => {
    cityCounts[c] = { total: 0, fraud: 0 };
  });

  transactions.forEach((t) => {
    const loc = normalizeCityKey(t.location);
    if (cityCounts[loc]) {
      cityCounts[loc].total++;
      if (t.riskLevel === 'HIGH' || t.isFraud) {
        cityCounts[loc].fraud++;
      }
    }
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-text-primary">
          <Globe className="w-4 h-4 text-accent-teal" />
          <span>GEOGRAPHIC TELEMETRY RADAR</span>
        </div>
        <span className="text-xs font-mono text-text-secondary font-medium">12 Global Metro Nodes (incl. India)</span>
      </div>

      {/* SVG Global Radar Dot Map */}
      <div className="relative w-full aspect-[2.4/1] bg-surface-raised rounded-lg overflow-hidden border border-border-strong flex items-center justify-center">
        <svg viewBox="0 0 480 200" className="w-full h-full opacity-90">
          {/* Subtle continent silhouettes */}
          <g fill="#1A2E22" opacity="0.6">
            <ellipse cx="120" cy="70" rx="40" ry="25" />
            <ellipse cx="140" cy="130" rx="25" ry="35" />
            <ellipse cx="250" cy="65" rx="30" ry="20" />
            <ellipse cx="260" cy="115" rx="35" ry="30" />
            <ellipse cx="360" cy="80" rx="55" ry="30" />
            <ellipse cx="420" cy="160" rx="30" ry="20" />
          </g>

          {/* Grid lines */}
          <line x1="0" y1="100" x2="480" y2="100" stroke="#2A4033" strokeDasharray="3,3" strokeWidth="0.8" />
          <line x1="240" y1="0" x2="240" y2="200" stroke="#2A4033" strokeDasharray="3,3" strokeWidth="0.8" />

          {/* City Nodes */}
          {Object.entries(CITY_COORDS).map(([code, coords]) => {
            const counts = cityCounts[code] || { total: 0, fraud: 0 };
            const hasFraud = counts.fraud > 0;
            const hasTraffic = counts.total > 0;

            const dotColor = hasFraud ? '#FF3B5C' : hasTraffic ? '#00FF9C' : '#7F9C8B';
            const radius = hasFraud ? 5 : hasTraffic ? 4 : 2.5;

            return (
              <g key={code} className="cursor-pointer group">
                {hasFraud && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={radius + 4}
                    fill="none"
                    stroke="#FF3B5C"
                    strokeWidth="1.5"
                    className="animate-ping origin-center"
                  />
                )}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={radius}
                  fill={dotColor}
                  className="transition-all duration-300"
                />
                <text
                  x={coords.x}
                  y={coords.y - 7}
                  fill="#E8FFF3"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  className="pointer-events-none select-none font-semibold"
                >
                  {coords.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-xs font-mono text-text-secondary mt-3 pt-2 border-t border-border">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent inline-block" /> Nominal Traffic
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-semantic-high inline-block" /> Flagged Anomalies
        </span>
      </div>
    </div>
  );
};
