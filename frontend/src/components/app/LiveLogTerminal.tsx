import React, { useState, useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';

export const LiveLogTerminal: React.FC = () => {
  const { logs } = useTransactionStore();
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'CRIT'>('ALL');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to top of list as new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level === filterLevel;
  });

  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col h-64 overflow-hidden shadow-2xl">
      {/* Terminal Title Bar */}
      <div className="h-9 bg-surface-raised border-b border-border px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 text-xs font-mono text-accent font-bold">
          <Terminal className="w-3.5 h-3.5" />
          <span>LIVE EVENT STREAM // STOMP WS</span>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
            className="bg-surface border border-border text-xs font-mono text-text-secondary px-2 py-0.5 rounded focus:outline-none"
          >
            <option value="ALL">ALL LEVELS</option>
            <option value="CRIT">CRITICAL ONLY</option>
            <option value="WARN">WARNING ONLY</option>
            <option value="INFO">INFO ONLY</option>
          </select>
          <span className="text-xs font-mono text-text-secondary">
            {filteredLogs.length} events
          </span>
        </div>
      </div>

      {/* Log Output Body */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-xs leading-relaxed bg-[#050806]"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-text-secondary italic py-6 text-center">
            Waiting for real-time WebSocket frames...
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-text-secondary shrink-0 text-xs">[{log.time}]</span>
              <span
                className={`font-bold shrink-0 text-xs ${
                  log.level === 'CRIT'
                    ? 'text-semantic-high'
                    : log.level === 'WARN'
                    ? 'text-semantic-medium'
                    : 'text-accent'
                }`}
              >
                [{log.level}]
              </span>
              <span
                className={
                  log.level === 'CRIT'
                    ? 'text-semantic-high font-semibold'
                    : log.level === 'WARN'
                    ? 'text-semantic-medium font-medium'
                    : 'text-text-primary'
                }
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
