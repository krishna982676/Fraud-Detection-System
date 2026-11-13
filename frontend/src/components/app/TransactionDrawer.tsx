import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useMatch } from 'react-router-dom';
import { User, MapPin, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { getUserDetail, getTransactionById } from '../../api/transactions';
import type { AnalysisResponse, UserDetailResponse } from '../../types/api';
import { formatCurrency, cn } from '../../lib/utils';

interface TransactionDrawerProps {
  transaction?: AnalysisResponse | null;
  onClose?: () => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transaction: propTransaction,
  onClose: propOnClose,
}) => {
  const params = useParams<{ txnId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const pathMatch = location.pathname.match(/\/app\/transactions\/([^/?#]+)/);
  const txnId = params.txnId || (pathMatch ? decodeURIComponent(pathMatch[1]) : undefined);

  const [fetchedTxn, setFetchedTxn] = useState<AnalysisResponse | null>(null);
  const [loadingTxn, setLoadingTxn] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetailResponse | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Determine active transaction (prop or route param)
  const activeTxn = propTransaction?.transactionId === txnId ? propTransaction : fetchedTxn || propTransaction;

  // Load transaction by ID if route param exists but not in memory
  useEffect(() => {
    if (txnId && (!propTransaction || propTransaction.transactionId !== txnId)) {
      setLoadingTxn(true);
      getTransactionById(txnId)
        .then((data) => {
          setFetchedTxn(data);
        })
        .catch(() => {
          setFetchedTxn(null);
        })
        .finally(() => setLoadingTxn(false));
    } else if (!txnId) {
      setFetchedTxn(null);
    }
  }, [txnId, propTransaction]);

  // Load user profiling details
  useEffect(() => {
    if (!activeTxn?.userId) {
      setUserDetails(null);
      return;
    }
    let mounted = true;
    setLoadingUser(true);
    getUserDetail(activeTxn.userId)
      .then((details) => {
        if (mounted) setUserDetails(details);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingUser(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeTxn?.userId]);

  const handleClose = () => {
    if (propOnClose) propOnClose();
    if (txnId) {
      navigate(`/app/transactions${location.search}`);
    }
  };

  const isOpen = Boolean(txnId || propTransaction);

  if (!isOpen) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2 font-mono">
          {activeTxn?.riskLevel && <Badge riskLevel={activeTxn.riskLevel}>{activeTxn.riskLevel}</Badge>}
          <span className="text-accent font-bold">{txnId || activeTxn?.transactionId || 'Loading...'}</span>
        </div>
      }
      subtitle={
        activeTxn
          ? `User: ${activeTxn.userId} • ${formatCurrency(activeTxn.amount)} • ${activeTxn.merchantCategory}`
          : 'Fetching security telemetry...'
      }
    >
      {loadingTxn && !activeTxn ? (
        <div className="p-8 text-center text-text-secondary font-mono text-xs">
          Loading transaction inspection data...
        </div>
      ) : activeTxn ? (
        <div className="space-y-6 font-mono text-xs">
          {/* 1. Score Breakdown */}
          <div className="space-y-3 bg-surface-raised p-4 rounded-xl border border-border">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-semibold uppercase">Composite Risk Score</span>
              <span className="text-text-primary font-bold text-sm">
                {Math.round((activeTxn.finalScore ?? activeTxn.fraudProbability) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
              <div
                className={cn(
                  'h-full',
                  (activeTxn.finalScore ?? activeTxn.fraudProbability) >= 0.7 ? 'bg-semantic-high' :
                  (activeTxn.finalScore ?? activeTxn.fraudProbability) >= 0.4 ? 'bg-semantic-medium' :
                  'bg-accent'
                )}
                style={{ width: `${Math.min(100, Math.round((activeTxn.finalScore ?? activeTxn.fraudProbability) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-text-secondary pt-1">
              <span>ML Score: {Math.round((activeTxn.mlScore ?? activeTxn.fraudProbability) * 100)}%</span>
              <span>Rule Score: {Math.round((activeTxn.ruleScore || 0) * 100)}%</span>
            </div>
          </div>

          {/* 2. Transaction Telemetry */}
          <div className="space-y-2 bg-surface-raised p-4 rounded-xl border border-border">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider mb-2">
              Transaction Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-text-secondary block">Amount:</span>
                <span className="text-text-primary font-bold">{formatCurrency(activeTxn.amount)}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Location:</span>
                <span className="text-text-primary font-bold">{activeTxn.location}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Category:</span>
                <span className="text-text-primary font-bold">{activeTxn.merchantCategory}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Device Type:</span>
                <span className="text-text-primary font-bold">{activeTxn.deviceType || 'UNKNOWN'}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Decision:</span>
                <span className="text-accent font-bold">{activeTxn.decision || (activeTxn.isFraud ? 'BLOCK' : 'APPROVE')}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Timestamp:</span>
                <span className="text-text-secondary">{new Date(activeTxn.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 3. Structured Violations */}
          {activeTxn.structuredReasons && activeTxn.structuredReasons.length > 0 && (
            <div className="space-y-2 bg-surface-raised p-4 rounded-xl border border-border">
              <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider mb-2">
                Triggered Anomaly Rules
              </h4>
              <div className="space-y-2">
                {activeTxn.structuredReasons.map((r, i) => (
                  <div key={i} className="p-2 rounded bg-surface border border-border text-xs flex items-start gap-2">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0',
                      r.severity === 'HIGH' ? 'bg-semantic-high/20 text-semantic-high' :
                      r.severity === 'MED' ? 'bg-semantic-medium/20 text-semantic-medium' :
                      'bg-accent/20 text-accent'
                    )}>
                      {r.severity}
                    </span>
                    <span className="text-text-primary">{r.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. User Behavioral Profile Cache */}
          <div className="space-y-2 bg-surface-raised p-4 rounded-xl border border-border">
            <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider mb-2">
              Behavioral Profile ({activeTxn.userId})
            </h4>
            {loadingUser ? (
              <p className="text-xs text-text-secondary">Loading profile memory...</p>
            ) : userDetails ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-secondary block">Baseline Mean:</span>
                  <span className="text-text-primary font-bold">
                    {formatCurrency(userDetails.avgAmount ?? userDetails.profile?.meanAmount ?? 0)}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Home Base:</span>
                  <span className="text-text-primary font-bold">
                    {userDetails.homeLocation || userDetails.profile?.lastKnownCity || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Total Txns:</span>
                  <span className="text-text-primary font-bold">
                    {userDetails.totalTransactions ?? userDetails.profile?.totalTransactions ?? 0}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Typical Hours:</span>
                  <span className="text-text-primary font-bold">
                    {userDetails.commonHours?.slice(0, 3).join(', ') || 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">No prior behavioral baseline established.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-text-secondary font-mono text-xs">
          Transaction record {txnId} not found in ingestion history.
        </div>
      )}
    </Drawer>
  );
};

export default TransactionDrawer;
