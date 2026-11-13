import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Activity, Play, Pause, Trash2, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useTransactionStore } from '../../store/transactionStore';
import { getRecentTransactions } from '../../api/transactions';
import { formatCurrency, getRelativeTime, cn } from '../../lib/utils';
import { BRAND } from '../../config/brand';
import type { AnalysisResponse } from '../../types/api';

const CATEGORIES = [
  'ALL',
  'GROCERY',
  'DINING',
  'ENTERTAINMENT',
  'ELECTRONICS',
  'TRAVEL',
  'LUXURY',
  'TRANSFER',
  'UTILITIES',
];

export const TransactionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { txnId } = useParams<{ txnId?: string }>();
  const { transactions, isPaused, setPaused, clearTransactions, setSelectedTransaction } = useTransactionStore();

  // URL Query Params state
  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = parseInt(searchParams.get('size') || '25', 10);
  const riskFilter = searchParams.get('risk') || 'ALL';
  const catFilter = searchParams.get('category') || 'ALL';
  const sort = searchParams.get('sort') || 'timestamp_desc';
  const querySearch = searchParams.get('search') || '';

  const [searchInputValue, setSearchInputValue] = useState(querySearch);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync search input if URL changes externally (e.g. Back/Forward)
  useEffect(() => {
    setSearchInputValue(querySearch);
  }, [querySearch]);

  // Server-side loaded transactions fallback if buffer is empty
  const [serverTxns, setServerTxns] = useState<AnalysisResponse[]>([]);
  const [loadingServer, setLoadingServer] = useState(false);

  useEffect(() => {
    if (transactions.length === 0) {
      setLoadingServer(true);
      getRecentTransactions(0, 100)
        .then((res) => {
          if (res?.content) setServerTxns(res.content);
        })
        .catch(() => {})
        .finally(() => setLoadingServer(false));
    }
  }, [transactions.length]);

  const pool = transactions.length > 0 ? transactions : serverTxns;

  // Filter and sort
  const filtered = useMemo(() => {
    return pool
      .filter((t) => {
        if (riskFilter !== 'ALL' && t.riskLevel !== riskFilter) return false;
        if (catFilter !== 'ALL' && t.merchantCategory?.toUpperCase() !== catFilter.toUpperCase()) return false;
        if (querySearch.trim()) {
          const q = querySearch.toLowerCase();
          const matchId = t.transactionId?.toLowerCase().includes(q);
          const matchUser = t.userId?.toLowerCase().includes(q);
          const matchLoc = t.location?.toLowerCase().includes(q);
          if (!matchId && !matchUser && !matchLoc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === 'amount_desc') return b.amount - a.amount;
        if (sort === 'amount_asc') return a.amount - b.amount;
        if (sort === 'timestamp_asc') {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [pool, riskFilter, catFilter, querySearch, sort]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(Math.max(0, page), totalPages - 1);
  const paginatedRows = filtered.slice(currentPage * size, (currentPage + 1) * size);

  // Update query params helper
  const updateParams = (updates: Record<string, string | null>, usePush = false) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || (key === 'risk' && val === 'ALL') || (key === 'category' && val === 'ALL') || (key === 'page' && val === '0')) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next, { replace: !usePush });
  };

  // Debounced search typing (uses replace: true so typing doesn't spam browser history)
  const handleSearchChange = (val: string) => {
    setSearchInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ search: val.trim() || null, page: '0' }, false);
    }, 300);
  };

  const handleRowClick = (t: AnalysisResponse) => {
    setSelectedTransaction(t);
    // Push navigation to route with query string preserved
    navigate(`/app/transactions/${t.transactionId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  };

  return (
    <>
      <Helmet>
        <title>{BRAND.name} // Transactions Ingestion Stream</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary font-mono flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Live Ingestion Pipeline
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Real-time transaction stream buffered via STOMP /topic/transactions with server-side pagination and filter state.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isPaused ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 mr-1" /> : <Pause className="w-3.5 h-3.5 mr-1" />}
              {isPaused ? 'Resume Feed' : 'Pause Feed'}
            </Button>
            <Button variant="outline" size="sm" onClick={clearTransactions}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear Buffer
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
            <input
              value={searchInputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Filter by transaction, user, or location..."
              className="w-full bg-surface-raised border border-border rounded-lg pl-9 pr-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent hover:border-border-strong text-xs font-mono"
            />
          </div>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => updateParams({ risk: e.target.value, page: '0' }, true)}
            className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none cursor-pointer hover:border-border-strong text-xs font-mono"
          >
            <option value="ALL" className="bg-surface text-text-primary">All Risk Tiers</option>
            <option value="HIGH" className="bg-surface text-text-primary">HIGH Risk (&ge;70%)</option>
            <option value="MEDIUM" className="bg-surface text-text-primary">MEDIUM Risk (40-69%)</option>
            <option value="LOW" className="bg-surface text-text-primary">LOW Risk (&lt;40%)</option>
          </select>

          {/* Category Filter */}
          <select
            value={catFilter}
            onChange={(e) => updateParams({ category: e.target.value, page: '0' }, true)}
            className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none cursor-pointer hover:border-border-strong text-xs font-mono"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-surface text-text-primary">
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Sort Selection */}
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value }, true)}
            className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none cursor-pointer hover:border-border-strong text-xs font-mono"
          >
            <option value="timestamp_desc" className="bg-surface text-text-primary">Newest First</option>
            <option value="timestamp_asc" className="bg-surface text-text-primary">Oldest First</option>
            <option value="amount_desc" className="bg-surface text-text-primary">Highest Amount</option>
            <option value="amount_asc" className="bg-surface text-text-primary">Lowest Amount</option>
          </select>

          {/* Page Size */}
          <select
            value={size}
            onChange={(e) => updateParams({ size: e.target.value, page: '0' }, true)}
            className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none cursor-pointer hover:border-border-strong text-xs font-mono"
          >
            <option value="15" className="bg-surface text-text-primary">15 per page</option>
            <option value="25" className="bg-surface text-text-primary">25 per page</option>
            <option value="50" className="bg-surface text-text-primary">50 per page</option>
          </select>

          <span className="text-text-secondary text-xs font-semibold ml-auto">
            Showing {paginatedRows.length} of {filtered.length} rows (Pool: {pool.length})
          </span>
        </div>

        {/* Main Ingestion Table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-surface-raised border-b border-border text-text-secondary text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Score Breakdown</th>
                  <th className="py-3 px-4">Violations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-text-secondary text-xs">
                      {loadingServer ? 'Loading transactions from server...' : 'No matching transactions found in buffer.'}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((t) => (
                    <tr
                      key={t.transactionId}
                      onClick={() => handleRowClick(t)}
                      className={cn(
                        'hover:bg-surface-raised transition-colors cursor-pointer',
                        t.transactionId === txnId && 'bg-accent/15 border-l-2 border-accent',
                        t.riskLevel === 'HIGH' && t.transactionId !== txnId && 'bg-semantic-high/5 hover:bg-semantic-high/10'
                      )}
                    >
                      <td className="py-3 px-4 text-text-secondary text-xs whitespace-nowrap">
                        {getRelativeTime(t.timestamp)}
                      </td>
                      <td className="py-3 px-4 text-accent font-bold hover:underline">
                        {t.transactionId}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{t.userId}</td>
                      <td className="py-3 px-4 text-text-primary font-bold">{formatCurrency(t.amount)}</td>
                      <td className="py-3 px-4 text-text-secondary text-xs uppercase">
                        {t.merchantCategory}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{t.location}</td>
                      <td className="py-3 px-4">
                        <Badge riskLevel={t.riskLevel} className="text-xs px-2 py-0.5">
                          {t.riskLevel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-accent font-bold">{Math.round((t.fraudProbability ?? 0) * 100)}% ML</span>
                        {' + '}
                        <span className="text-semantic-medium font-bold">{Math.round((t.ruleScore || 0) * 100)}% R</span>
                      </td>
                      <td className="py-3 px-4">
                        {t.structuredReasons && t.structuredReasons.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {t.structuredReasons.slice(0, 2).map((r, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-xs bg-semantic-high/15 text-semantic-high border border-semantic-high/40 font-bold"
                              >
                                {r.code}
                              </span>
                            ))}
                            {t.structuredReasons.length > 2 && (
                              <span className="text-xs text-text-secondary font-semibold">
                                +{t.structuredReasons.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-secondary text-xs">Nominal</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between font-mono text-xs">
              <span className="text-text-secondary">
                Page <strong className="text-text-primary">{currentPage + 1}</strong> of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => updateParams({ page: String(currentPage - 1) }, true)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => updateParams({ page: String(currentPage + 1) }, true)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TransactionsPage;
