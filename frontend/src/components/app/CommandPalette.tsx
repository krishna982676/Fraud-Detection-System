import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Activity, Cpu, AlertTriangle, PlayCircle, Settings, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useTransactionStore } from '../../store/transactionStore';

interface CommandPaletteProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, open, onClose }) => {
  const isVisible = isOpen ?? open ?? false;
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { transactions, setSelectedTransaction } = useTransactionStore();

  useEffect(() => {
    if (isVisible) {
      setQuery('');
    }
  }, [isVisible]);

  const handleSelectPage = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSelectTransaction = (txnId: string) => {
    const target = transactions.find((t) => t.transactionId.toLowerCase().includes(txnId.toLowerCase()));
    if (target) {
      setSelectedTransaction(target);
    }
    navigate(`/app/transactions/${txnId}`);
    onClose();
  };

  const filteredTxns = transactions
    .filter(
      (t) =>
        t.transactionId.toLowerCase().includes(query.toLowerCase()) ||
        t.userId.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 6);

  return (
    <Modal isOpen={isVisible} onClose={onClose} maxWidth="max-w-xl">
      <div className="flex items-center gap-3 border-b border-border pb-3 mb-4">
        <Search className="w-5 h-5 text-accent shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Jump to transaction, user ID, or console page... (Cmd+K)"
          className="w-full bg-transparent text-sm text-white placeholder:text-text-muted focus:outline-none font-mono"
        />
        <span className="text-[10px] font-mono text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border">
          ESC
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto space-y-4 font-mono text-xs">
        {/* Navigation Quick Links */}
        <div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
            Console Navigation
          </span>
          <div className="space-y-1">
            <button
              onClick={() => handleSelectPage('/app/operations')}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-raised hover:text-accent text-left text-text-secondary transition-colors"
            >
              <Activity className="w-4 h-4 text-accent" />
              <span>Operations Console (Dashboard)</span>
            </button>
            <button
              onClick={() => handleSelectPage('/app/transactions')}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-raised hover:text-accent text-left text-text-secondary transition-colors"
            >
              <Activity className="w-4 h-4 text-accent" />
              <span>Live Ingestion Pipeline (Transactions)</span>
            </button>
            <button
              onClick={() => handleSelectPage('/app/alerts')}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-raised hover:text-accent text-left text-text-secondary transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-semantic-high" />
              <span>Security Alert Triage Feed</span>
            </button>
            <button
              onClick={() => handleSelectPage('/app/model')}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-raised hover:text-accent text-left text-text-secondary transition-colors"
            >
              <Cpu className="w-4 h-4 text-accent-teal" />
              <span>Machine Learning Model Lab</span>
            </button>
            <button
              onClick={() => handleSelectPage('/app/simulator')}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-raised hover:text-accent text-left text-text-secondary transition-colors"
            >
              <PlayCircle className="w-4 h-4 text-accent" />
              <span>Adversarial Attack Simulator</span>
            </button>
            <button
              onClick={() => handleSelectPage('/app/settings')}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-raised hover:text-accent text-left text-text-secondary transition-colors"
            >
              <Settings className="w-4 h-4 text-text-secondary" />
              <span>System Settings &amp; Policies</span>
            </button>
          </div>
        </div>

        {/* Live Transaction Matches */}
        {filteredTxns.length > 0 && (
          <div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
              Active Transactions In Buffer
            </span>
            <div className="space-y-1">
              {filteredTxns.map((t) => (
                <button
                  key={t.transactionId}
                  onClick={() => handleSelectTransaction(t.transactionId)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-raised hover:text-accent text-left text-text-secondary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-text-muted" />
                    <span className="font-bold text-white">{t.transactionId}</span>
                    <span className="text-text-muted">({t.userId})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white">${t.amount.toFixed(2)}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        t.riskLevel === 'HIGH'
                          ? 'border-semantic-high text-semantic-high'
                          : t.riskLevel === 'MEDIUM'
                          ? 'border-semantic-medium text-semantic-medium'
                          : 'border-accent text-accent'
                      }`}
                    >
                      {t.riskLevel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CommandPalette;
