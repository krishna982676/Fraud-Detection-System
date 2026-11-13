import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import { useTransactionStore } from '../../store/transactionStore';
import { useWebSocket } from '../../hooks/useWebSocket';

const SAMPLE_FALLBACK = [
  { id: 'TXN-8801', user: 'USER-1042', amount: 48.2, cat: 'DINING', risk: 'LOW', score: 0.04 },
  { id: 'TXN-8802', user: 'USER-1088', amount: 1840.0, cat: 'LUXURY', risk: 'HIGH', score: 0.94 },
  { id: 'TXN-8803', user: 'USER-1015', amount: 12.5, cat: 'GROCERY', risk: 'LOW', score: 0.02 },
  { id: 'TXN-8804', user: 'USER-1067', amount: 310.0, cat: 'TRANSFER', risk: 'MEDIUM', score: 0.58 },
  { id: 'TXN-8805', user: 'USER-1092', amount: 799.99, cat: 'ELECTRONICS', risk: 'MEDIUM', score: 0.62 },
  { id: 'TXN-8806', user: 'USER-1033', amount: 4120.0, cat: 'TRANSFER', risk: 'HIGH', score: 0.98 },
  { id: 'TXN-8807', user: 'USER-1004', amount: 8.75, cat: 'ENTERTAINMENT', risk: 'LOW', score: 0.01 },
];

export const LiveTicker: React.FC = () => {
  const { isConnected } = useWebSocket();
  const { transactions } = useTransactionStore();
  const [tickerItems, setTickerItems] = useState(SAMPLE_FALLBACK);

  useEffect(() => {
    if (transactions.length > 0) {
      const mapped = transactions.slice(0, 10).map((t) => ({
        id: t.transactionId,
        user: t.userId,
        amount: t.amount,
        cat: t.merchantCategory,
        risk: t.riskLevel,
        score: t.finalScore,
      }));
      setTickerItems(mapped);
    }
  }, [transactions]);

  // Double items for seamless infinite scroll
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full border-y border-border/80 bg-surface/60 backdrop-blur-md py-3 overflow-hidden relative select-none">
      {/* Side Fade Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-base to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-base to-transparent z-10 pointer-events-none" />

      {/* Live Stream Status Indicator on Left */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-2 bg-surface-raised/90 border border-border px-2.5 py-1 rounded-full text-[10px] font-mono text-text-muted">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isConnected ? 'bg-cyber-green animate-pulse' : 'bg-semantic-medium'
          }`}
        />
        <span>{isConnected ? 'LIVE FEED' : 'REPLAY'}</span>
      </div>

      {/* Scrolling Track */}
      <div className="flex items-center gap-6 animate-ticker whitespace-nowrap pl-24">
        {displayItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-raised/80 border border-border/60 text-xs font-mono"
          >
            <span className="text-text-muted font-bold">{item.id}</span>
            <span className="text-text-secondary">{item.user}</span>
            <span className="text-text-primary font-bold">${item.amount.toFixed(2)}</span>
            <span className="text-[10px] text-text-muted uppercase">{item.cat}</span>
            <Badge riskLevel={item.risk as any} className="text-[10px] px-2 py-0">
              {item.risk} ({Math.round(item.score * 100)}%)
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

