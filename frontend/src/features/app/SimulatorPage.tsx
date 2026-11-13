import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import {
  PlayCircle,
  StopCircle,
  Zap,
  Send,
  Check,
  Copy,
  CheckCheck,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Clock,
  RotateCcw,
  Cpu,
  Sliders,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { analyzeTransaction } from '../../api/transactions';
import { useTransactionStore } from '../../store/transactionStore';
import type { TransactionRequest, AnalysisResponse, RiskLevel } from '../../types/api';
import { BRAND } from '../../config/brand';
import { cn } from '../../lib/utils';

const CITIES = [
  'NEW_YORK',
  'LONDON',
  'TOKYO',
  'PARIS',
  'SYDNEY',
  'BERLIN',
  'MUMBAI',
  'NEW_DELHI',
  'BENGALURU',
  'HYDERABAD',
  'CHENNAI',
  'KOLKATA',
  'PUNE',
  'INDIA',
  'TORONTO',
  'DUBAI',
  'SINGAPORE'
];
const CATEGORIES = ['GROCERY', 'DINING', 'ENTERTAINMENT', 'ELECTRONICS', 'TRAVEL', 'LUXURY', 'TRANSFER', 'UTILITIES'];

export type PresetId = 'coffee' | 'grocery' | 'midnight_luxury' | 'impossible_travel' | 'velocity_surge' | 'india_upi';

export interface PresetConfig {
  id: PresetId;
  label: string;
  badge: string;
  isAttack: boolean;
  data: TransactionRequest;
}

export const PRESET_CONFIGS: Record<PresetId, PresetConfig> = {
  coffee: {
    id: 'coffee',
    label: 'Normal Coffee ($4.50)',
    badge: 'NORMAL',
    isAttack: false,
    data: {
      userId: 'USER-1005',
      amount: 4.5,
      merchantCategory: 'DINING',
      location: 'NEW_YORK',
      deviceType: 'MOBILE',
      hourOfDay: 9,
      distanceFromHome: 1.2,
      txnCountLast24h: 1,
      isInternational: false,
    },
  },
  grocery: {
    id: 'grocery',
    label: 'Weekly Grocery ($128.00)',
    badge: 'NORMAL',
    isAttack: false,
    data: {
      userId: 'USER-1012',
      amount: 128.0,
      merchantCategory: 'GROCERY',
      location: 'LONDON',
      deviceType: 'POS',
      hourOfDay: 17,
      distanceFromHome: 2.4,
      txnCountLast24h: 3,
      isInternational: false,
    },
  },
  midnight_luxury: {
    id: 'midnight_luxury',
    label: 'Midnight Luxury Attack ($4,200)',
    badge: 'ATTACK',
    isAttack: true,
    data: {
      userId: 'USER-1020',
      amount: 4200.0,
      merchantCategory: 'LUXURY',
      location: 'DUBAI',
      deviceType: 'WEB',
      hourOfDay: 3,
      distanceFromHome: 450.0,
      txnCountLast24h: 5,
      isInternational: true,
    },
  },
  impossible_travel: {
    id: 'impossible_travel',
    label: 'Impossible Travel Jump (8,400 km)',
    badge: 'ATTACK',
    isAttack: true,
    data: {
      userId: 'USER-1044',
      amount: 1850.0,
      merchantCategory: 'TRANSFER',
      location: 'SYDNEY',
      deviceType: 'MOBILE',
      hourOfDay: 14,
      distanceFromHome: 8400.0,
      txnCountLast24h: 2,
      isInternational: true,
    },
  },
  velocity_surge: {
    id: 'velocity_surge',
    label: 'Velocity Burst Surge (29 txns)',
    badge: 'BURST',
    isAttack: true,
    data: {
      userId: 'USER-1033',
      amount: 350.0,
      merchantCategory: 'ELECTRONICS',
      location: 'PARIS',
      deviceType: 'POS',
      hourOfDay: 21,
      distanceFromHome: 5.0,
      txnCountLast24h: 29,
      isInternational: false,
    },
  },
  india_upi: {
    id: 'india_upi',
    label: 'India UPI Fast Transfer (Bengaluru)',
    badge: 'UPI // NOMINAL',
    isAttack: false,
    data: {
      userId: 'USER-1008',
      amount: 30.0,
      merchantCategory: 'TRANSFER',
      location: 'BENGALURU',
      deviceType: 'MOBILE',
      hourOfDay: 14,
      distanceFromHome: 2.1,
      txnCountLast24h: 2,
      isInternational: false,
    },
  },
};

// 50 Diverse Persona Generators for continuous streaming
const USER_PERSONAS = Array.from({ length: 50 }, (_, i) => ({
  id: `USER-${1000 + i + 1}`,
  homeCity: CITIES[i % CITIES.length],
  baselineMean: 25 + (i * 7.5),
  favCategory: CATEGORIES[i % CATEGORIES.length],
  device: i % 2 === 0 ? 'MOBILE' : i % 3 === 0 ? 'POS' : 'WEB',
}));

export const SimulatorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addTransaction, setSelectedTransaction } = useTransactionStore();

  // Background Stream Simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [fraudRate, setFraudRate] = useState(5); // 5%
  const [speedMs, setSpeedMs] = useState(200); // 5/s
  const [simCount, setSimCount] = useState(0);

  // Preset Selection from URL or default
  const paramPreset = searchParams.get('preset') as PresetId | null;
  const initialPreset: PresetId = (paramPreset && PRESET_CONFIGS[paramPreset]) ? paramPreset : 'grocery';
  const [activePreset, setActivePreset] = useState<PresetId>(initialPreset);
  const [autoEvaluate, setAutoEvaluate] = useState(false);

  // Manual form values
  const [manualUser, setManualUser] = useState(PRESET_CONFIGS[initialPreset].data.userId);
  const [manualAmount, setManualAmount] = useState<number>(PRESET_CONFIGS[initialPreset].data.amount);
  const [manualCategory, setManualCategory] = useState(PRESET_CONFIGS[initialPreset].data.merchantCategory);
  const [manualLocation, setManualLocation] = useState(PRESET_CONFIGS[initialPreset].data.location);
  const [manualDevice, setManualDevice] = useState(PRESET_CONFIGS[initialPreset].data.deviceType);
  const [manualHour, setManualHour] = useState(PRESET_CONFIGS[initialPreset].data.hourOfDay);
  const [manualDist, setManualDist] = useState(PRESET_CONFIGS[initialPreset].data.distanceFromHome);
  const [manualTxns24h, setManualTxns24h] = useState(PRESET_CONFIGS[initialPreset].data.txnCountLast24h);
  const [manualIsIntl, setManualIsIntl] = useState(PRESET_CONFIGS[initialPreset].data.isInternational);

  // Inline Validation Errors
  const [errors, setErrors] = useState<{
    userId?: string;
    amount?: string;
    hourOfDay?: string;
    distanceFromHome?: string;
    txnCountLast24h?: string;
  }>({});

  // Execution states
  const [evaluating, setEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState<AnalysisResponse | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [recentEvaluations, setRecentEvaluations] = useState<AnalysisResponse[]>([]);
  const [curlCopied, setCurlCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const simRef = useRef<NodeJS.Timeout | null>(null);

  // Validate form fields
  const validateForm = useCallback((): boolean => {
    const errs: typeof errors = {};
    if (!manualUser || manualUser.trim() === '') {
      errs.userId = 'User ID is required';
    }
    if (manualAmount === undefined || isNaN(manualAmount) || manualAmount <= 0) {
      errs.amount = 'Amount must be greater than zero ($0.01+)';
    }
    if (manualHour === undefined || isNaN(manualHour) || manualHour < 0 || manualHour > 23) {
      errs.hourOfDay = 'Hour must be between 0 and 23';
    }
    if (manualDist === undefined || isNaN(manualDist) || manualDist < 0) {
      errs.distanceFromHome = 'Distance cannot be negative';
    }
    if (manualTxns24h === undefined || isNaN(manualTxns24h) || manualTxns24h < 0) {
      errs.txnCountLast24h = '24h Transaction count cannot be negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [manualUser, manualAmount, manualHour, manualDist, manualTxns24h]);

  // Execute single transaction evaluation
  const executeEvaluation = useCallback(async (customPayload?: TransactionRequest) => {
    if (!validateForm() && !customPayload) {
      toast.error('Please fix validation errors before evaluating.');
      return;
    }

    setEvaluating(true);
    setEvaluationError(null);

    const payload: TransactionRequest = customPayload || {
      userId: manualUser.trim(),
      amount: manualAmount,
      merchantCategory: manualCategory,
      location: manualLocation,
      deviceType: manualDevice,
      hourOfDay: manualHour,
      distanceFromHome: manualDist,
      txnCountLast24h: manualTxns24h,
      isInternational: manualIsIntl,
    };

    try {
      const res = await analyzeTransaction(payload);
      setLastResult(res);
      addTransaction(res);
      setSelectedTransaction(res);

      setRecentEvaluations((prev) => [res, ...prev.filter((p) => p.transactionId !== res.transactionId)].slice(0, 10));

      const finalPct = Math.round((res.finalScore ?? res.fraudProbability) * 100);
      const dec = res.decision || (res.isFraud || res.riskLevel === 'HIGH' ? 'BLOCK' : res.riskLevel === 'MEDIUM' ? 'REVIEW' : 'APPROVE');
      toast.success(`Evaluated: ${dec} (Risk ${finalPct}%) [${res.riskLevel}]`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Evaluation failed. Ensure backend service is reachable.';
      setEvaluationError(msg);
      toast.error(`Evaluation Error: ${msg}`);
    } finally {
      setEvaluating(false);
    }
  }, [
    validateForm,
    manualUser,
    manualAmount,
    manualCategory,
    manualLocation,
    manualDevice,
    manualHour,
    manualDist,
    manualTxns24h,
    manualIsIntl,
    addTransaction,
    setSelectedTransaction,
  ]);

  // Apply attack preset scenarios
  const applyPreset = (preset: PresetId, shouldAutoEval = autoEvaluate) => {
    setActivePreset(preset);
    setSearchParams({ preset }, { replace: true });

    const p = PRESET_CONFIGS[preset].data;
    setManualUser(p.userId);
    setManualAmount(p.amount);
    setManualCategory(p.merchantCategory);
    setManualLocation(p.location);
    setManualDevice(p.deviceType);
    setManualHour(p.hourOfDay);
    setManualDist(p.distanceFromHome);
    setManualTxns24h(p.txnCountLast24h);
    setManualIsIntl(p.isInternational);
    setErrors({});

    toast.info(`Preset loaded: ${PRESET_CONFIGS[preset].label}`);

    if (shouldAutoEval) {
      executeEvaluation(p);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeEvaluation();
  };

  // Automated Traffic Stream Tick Loop
  const generateSimulatedTxn = (forceFraud = false): TransactionRequest => {
    const persona = USER_PERSONAS[Math.floor(Math.random() * USER_PERSONAS.length)];
    const isFraudTxn = forceFraud || Math.random() * 100 < fraudRate;

    let amount = persona.baselineMean * (0.6 + Math.random() * 0.8);
    let category = persona.favCategory;
    let location = persona.homeCity;
    let dist = 1.0 + Math.random() * 10;
    let hour = 8 + Math.floor(Math.random() * 14);
    let isIntl = false;
    let count24 = 1 + Math.floor(Math.random() * 4);

    if (isFraudTxn) {
      const attackType = Math.random();
      if (attackType < 0.33) {
        location = CITIES.find((c) => c !== persona.homeCity) || 'TOKYO';
        dist = 7200 + Math.random() * 2000;
        category = 'LUXURY';
        amount = 3500 + Math.random() * 2000;
      } else if (attackType < 0.66) {
        hour = 3;
        category = 'TRANSFER';
        amount = 4500 + Math.random() * 3000;
        isIntl = true;
      } else {
        count24 = 28 + Math.floor(Math.random() * 15);
        category = 'ELECTRONICS';
        amount = 899 + Math.random() * 400;
      }
    }

    return {
      userId: persona.id,
      amount: Math.round(amount * 100) / 100,
      merchantCategory: category,
      location,
      deviceType: persona.device,
      hourOfDay: hour,
      distanceFromHome: Math.round(dist * 10) / 10,
      txnCountLast24h: count24,
      isInternational: isIntl,
    };
  };

  useEffect(() => {
    if (isSimulating) {
      simRef.current = setInterval(async () => {
        const payload = generateSimulatedTxn();
        try {
          const res = await analyzeTransaction(payload);
          addTransaction(res);
          setSimCount((c) => c + 1);
        } catch {
          // ignore error in background stream
        }
      }, speedMs);
    } else if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, [isSimulating, speedMs, fraudRate]);

  // Copy helpers
  const copyAsCurl = () => {
    const payload = {
      userId: manualUser.trim(),
      amount: manualAmount,
      merchantCategory: manualCategory,
      location: manualLocation,
      deviceType: manualDevice,
      hourOfDay: manualHour,
      distanceFromHome: manualDist,
      txnCountLast24h: manualTxns24h,
      isInternational: manualIsIntl,
    };
    const curl = `curl -X POST "http://localhost:8080/api/v1/transactions/analyze" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`;

    navigator.clipboard.writeText(curl);
    setCurlCopied(true);
    toast.success('Curl command copied to clipboard!');
    setTimeout(() => setCurlCopied(false), 2000);
  };

  const copyJsonResponse = () => {
    if (!lastResult) return;
    navigator.clipboard.writeText(JSON.stringify(lastResult, null, 2));
    setJsonCopied(true);
    toast.success('Response JSON copied to clipboard!');
    setTimeout(() => setJsonCopied(false), 2000);
  };

  // Decision styling helper
  const getDecisionBadge = (decision: string, riskLevel: RiskLevel) => {
    const dec = decision?.toUpperCase() || (riskLevel === 'HIGH' ? 'BLOCK' : riskLevel === 'MEDIUM' ? 'REVIEW' : 'APPROVE');
    if (dec === 'BLOCK') {
      return {
        text: 'BLOCK',
        bg: 'bg-rose-500/15 border-rose-500/50 text-rose-400',
        icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      };
    }
    if (dec === 'REVIEW') {
      return {
        text: 'REVIEW',
        bg: 'bg-amber-500/15 border-amber-500/50 text-amber-400',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      };
    }
    return {
      text: 'APPROVE',
      bg: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    };
  };

  return (
    <>
      <Helmet>
        <title>{BRAND.name} // Adversarial Traffic Simulator</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-text-primary font-mono flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-accent" />
            Adversarial Traffic &amp; Attack Simulator
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Inject synthetic transactional loads across 50 persona archetypes or test individual attack vectors with live ML pipeline feedback.
          </p>
        </div>

        {/* Section 1: Multi-Profile Continuous Simulator Controls */}
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-sm shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
            <div>
              <span className="font-bold text-text-primary text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                AUTOMATED TRAFFIC STREAM GENERATOR
              </span>
              <span className="text-xs text-text-secondary mt-1 block">
                Generates continuous Gaussian spending patterns with parameterized fraud attack injections into the pipeline.
              </span>
            </div>

            <Button
              variant={isSimulating ? 'outline' : 'primary'}
              size="md"
              onClick={() => setIsSimulating(!isSimulating)}
              className={isSimulating ? 'text-semantic-high border-semantic-high hover:bg-semantic-high/10' : ''}
            >
              {isSimulating ? <StopCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
              {isSimulating ? 'Halt Simulation' : 'Start Stream Injection'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Speed Selection */}
            <div>
              <label className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-2">
                Injection Speed / Rate
              </label>
              <select
                value={speedMs}
                onChange={(e) => setSpeedMs(parseInt(e.target.value))}
                className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 cursor-pointer hover:border-border-strong"
              >
                <option value={1000} className="bg-surface text-text-primary">1 Transaction / sec</option>
                <option value={200} className="bg-surface text-text-primary">5 Transactions / sec (Nominal)</option>
                <option value={100} className="bg-surface text-text-primary">10 Transactions / sec (Burst)</option>
              </select>
            </div>

            {/* Fraud Ratio Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider">
                  Adversarial Fraud Proportion
                </label>
                <span className="px-2 py-0.5 rounded bg-surface-raised border border-border-strong text-xs font-mono font-bold text-text-primary">
                  {fraudRate}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={fraudRate}
                onChange={(e) => setFraudRate(parseInt(e.target.value))}
                className="w-full cyber-slider cursor-pointer"
                aria-label="Adversarial fraud proportion percentage"
              />
            </div>

            {/* Status Readout */}
            <div className="bg-surface-raised p-4 rounded-lg border border-border-strong flex items-center justify-between">
              <div>
                <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider block">INJECTED EVENTS</span>
                <span className="text-2xl font-bold text-text-primary tabular-nums font-mono">{simCount}</span>
              </div>
              <div className="text-right">
                <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider block">STATUS</span>
                <span className={cn(
                  'text-xs font-bold font-mono tracking-wide',
                  isSimulating ? 'text-accent animate-pulse' : 'text-text-secondary'
                )}>
                  {isSimulating ? 'ACTIVE STREAM' : 'IDLE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Scenario Lab Form */}
        <div className="bg-surface border border-border rounded-xl p-6 font-mono text-sm shadow-2xl">
          <div className="border-b border-border pb-3 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent" />
                // SINGLE-PAYLOAD EVALUATION LAB (POST /api/v1/transactions/analyze)
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Select an attack archetype preset or customize vector parameters to inspect exact model score reactions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoEvaluate}
                  onChange={(e) => setAutoEvaluate(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent bg-surface-raised"
                />
                Auto-evaluate on preset selection
              </label>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mb-6">
            <span className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-2.5">
              Preset Incident Signatures:
            </span>
            <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Preset incident signatures">
              {(Object.keys(PRESET_CONFIGS) as PresetId[]).map((pKey) => {
                const conf = PRESET_CONFIGS[pKey];
                const isSelected = activePreset === conf.id;
                return (
                  <button
                    key={conf.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-pressed={isSelected}
                    onClick={() => applyPreset(conf.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all flex items-center gap-1.5 cursor-pointer',
                      isSelected
                        ? 'bg-accent/15 border-accent text-accent font-bold shadow-glow-green-sm'
                        : 'bg-transparent border-border-strong text-text-secondary hover:border-accent/60 hover:text-text-primary'
                    )}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : conf.isAttack ? (
                      <span className="w-2 h-2 rounded-full bg-semantic-high shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-border-strong shrink-0" />
                    )}
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {/* User ID */}
              <div>
                <label htmlFor="sim-user" className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  User ID
                </label>
                <input
                  id="sim-user"
                  value={manualUser}
                  onChange={(e) => {
                    setManualUser(e.target.value);
                    if (errors.userId) setErrors((prev) => ({ ...prev, userId: undefined }));
                  }}
                  className={cn(
                    'w-full bg-surface-raised border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:ring-1 hover:border-border-strong',
                    errors.userId ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-border focus:border-accent focus:ring-accent/50'
                  )}
                  required
                />
                {errors.userId && <p className="text-[11px] text-rose-400 mt-1">{errors.userId}</p>}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="sim-amount" className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Amount ($)
                </label>
                <input
                  id="sim-amount"
                  type="number"
                  step="0.01"
                  value={manualAmount}
                  onChange={(e) => {
                    setManualAmount(parseFloat(e.target.value) || 0);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  className={cn(
                    'w-full bg-surface-raised border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:ring-1 hover:border-border-strong',
                    errors.amount ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-border focus:border-accent focus:ring-accent/50'
                  )}
                  required
                />
                {errors.amount && <p className="text-[11px] text-rose-400 mt-1">{errors.amount}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Category
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 cursor-pointer hover:border-border-strong"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-surface text-text-primary">{c}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Location City
                </label>
                <select
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 cursor-pointer hover:border-border-strong"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c} className="bg-surface text-text-primary">{c}</option>
                  ))}
                </select>
              </div>

              {/* Device */}
              <div>
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Device Type
                </label>
                <select
                  value={manualDevice}
                  onChange={(e) => setManualDevice(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 cursor-pointer hover:border-border-strong"
                >
                  <option value="MOBILE" className="bg-surface text-text-primary">MOBILE</option>
                  <option value="WEB" className="bg-surface text-text-primary">WEB</option>
                  <option value="POS" className="bg-surface text-text-primary">POS</option>
                  <option value="ATM" className="bg-surface text-text-primary">ATM</option>
                </select>
              </div>

              {/* Hour */}
              <div>
                <label htmlFor="sim-hour" className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Hour of Day (0-23)
                </label>
                <input
                  id="sim-hour"
                  type="number"
                  min="0"
                  max="23"
                  value={manualHour}
                  onChange={(e) => {
                    setManualHour(parseInt(e.target.value) || 0);
                    if (errors.hourOfDay) setErrors((prev) => ({ ...prev, hourOfDay: undefined }));
                  }}
                  className={cn(
                    'w-full bg-surface-raised border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:ring-1 hover:border-border-strong',
                    errors.hourOfDay ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-border focus:border-accent focus:ring-accent/50'
                  )}
                  required
                />
                {errors.hourOfDay && <p className="text-[11px] text-rose-400 mt-1">{errors.hourOfDay}</p>}
              </div>

              {/* Distance */}
              <div>
                <label htmlFor="sim-dist" className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Distance (km)
                </label>
                <input
                  id="sim-dist"
                  type="number"
                  step="0.1"
                  value={manualDist}
                  onChange={(e) => {
                    setManualDist(parseFloat(e.target.value) || 0);
                    if (errors.distanceFromHome) setErrors((prev) => ({ ...prev, distanceFromHome: undefined }));
                  }}
                  className={cn(
                    'w-full bg-surface-raised border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:ring-1 hover:border-border-strong',
                    errors.distanceFromHome ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-border focus:border-accent focus:ring-accent/50'
                  )}
                  required
                />
                {errors.distanceFromHome && <p className="text-[11px] text-rose-400 mt-1">{errors.distanceFromHome}</p>}
              </div>

              {/* Txns 24h */}
              <div>
                <label htmlFor="sim-txns" className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  24h Count
                </label>
                <input
                  id="sim-txns"
                  type="number"
                  min="0"
                  value={manualTxns24h}
                  onChange={(e) => {
                    setManualTxns24h(parseInt(e.target.value) || 0);
                    if (errors.txnCountLast24h) setErrors((prev) => ({ ...prev, txnCountLast24h: undefined }));
                  }}
                  className={cn(
                    'w-full bg-surface-raised border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:ring-1 hover:border-border-strong',
                    errors.txnCountLast24h ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-border focus:border-accent focus:ring-accent/50'
                  )}
                  required
                />
                {errors.txnCountLast24h && <p className="text-[11px] text-rose-400 mt-1">{errors.txnCountLast24h}</p>}
              </div>

              {/* Cross-border */}
              <div>
                <label className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Cross-Border?
                </label>
                <select
                  value={manualIsIntl ? 'true' : 'false'}
                  onChange={(e) => setManualIsIntl(e.target.value === 'true')}
                  className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 cursor-pointer hover:border-border-strong"
                >
                  <option value="false" className="bg-surface text-text-primary">Domestic</option>
                  <option value="true" className="bg-surface text-text-primary">International (Cross-border)</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={evaluating}
                  disabled={evaluating}
                  className="w-full"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Evaluate Risk
                </Button>
              </div>
            </div>

            {/* Utility action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyAsCurl}
                  className="text-xs py-1 px-2.5 h-auto text-text-secondary hover:text-text-primary"
                >
                  {curlCopied ? <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-accent" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  Copy as curl
                </Button>
                {lastResult && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyJsonResponse}
                    className="text-xs py-1 px-2.5 h-auto text-text-secondary hover:text-text-primary"
                  >
                    {jsonCopied ? <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-accent" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                    Copy JSON response
                  </Button>
                )}
              </div>

              <div className="text-[11px] text-text-secondary/80 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-accent" />
                <span>Payload connects to active Weka Random Forest ML pipeline</span>
              </div>
            </div>
          </form>

          {/* Error Banner with Retry */}
          {evaluationError && (
            <div className="mt-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm">Evaluation Failed</div>
                  <div className="text-xs opacity-90">{evaluationError}</div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => executeEvaluation()}
                className="text-rose-300 border-rose-500/50 hover:bg-rose-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Retry
              </Button>
            </div>
          )}

          {/* Result Panel */}
          {lastResult && (
            <div className="mt-6 border-t border-border pt-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const badge = getDecisionBadge(lastResult.decision || '', lastResult.riskLevel);
                    return (
                      <div className={cn('px-3 py-1 rounded-md border font-mono font-bold text-xs flex items-center gap-1.5', badge.bg)}>
                        {badge.icon}
                        <span>DECISION: {badge.text}</span>
                      </div>
                    );
                  })()}

                  <div className={cn(
                    'px-2.5 py-0.5 rounded text-xs font-mono font-semibold border',
                    lastResult.riskLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                    lastResult.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  )}>
                    RISK {lastResult.riskLevel}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    Latency: <strong className="text-text-primary font-mono">{lastResult.latencyMs ?? 15} ms</strong>
                  </span>
                  <span>
                    Model: <strong className="text-text-primary font-mono">{lastResult.modelVersion || 'RandomForest (v2.0)'}</strong>
                  </span>
                  <span>
                    Threshold: <strong className="text-text-primary font-mono">{lastResult.thresholdUsed ?? 0.20}</strong>
                  </span>
                </div>
              </div>

              {/* Gauges & Factor Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Gauge */}
                <div className="bg-surface-raised p-4 rounded-xl border border-border flex flex-col justify-between">
                  <div className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-2">
                    Composite Risk Score
                  </div>
                  <div className="flex items-baseline gap-2 my-2">
                    <span className="text-4xl font-extrabold font-mono text-text-primary tabular-nums">
                      {Math.round((lastResult.finalScore ?? lastResult.fraudProbability) * 100)}%
                    </span>
                    <span className="text-xs text-text-secondary font-mono">
                      (Raw: {(lastResult.finalScore ?? lastResult.fraudProbability).toFixed(3)})
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-surface h-2.5 rounded-full overflow-hidden border border-border-strong mt-2">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        (lastResult.finalScore ?? lastResult.fraudProbability) >= 0.7 ? 'bg-rose-500' :
                        (lastResult.finalScore ?? lastResult.fraudProbability) >= 0.2 ? 'bg-amber-500' :
                        'bg-emerald-500'
                      )}
                      style={{ width: `${Math.min(100, Math.max(2, (lastResult.finalScore ?? lastResult.fraudProbability) * 100))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-text-secondary font-mono mt-3 pt-2 border-t border-border/50">
                    <span>ML Model: {Math.round((lastResult.mlScore ?? lastResult.scoreBreakdown?.mlScore ?? lastResult.fraudProbability) * 100)}%</span>
                    <span>Rule Engine: {Math.round((lastResult.ruleScore ?? lastResult.scoreBreakdown?.ruleScore ?? 0) * 100)}%</span>
                  </div>
                </div>

                {/* Structured Risk Reasons */}
                <div className="bg-surface-raised p-4 rounded-xl border border-border">
                  <div className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-2">
                    Structured Reasons ({lastResult.structuredReasons?.length || lastResult.reasons?.length || 0})
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {lastResult.structuredReasons && lastResult.structuredReasons.length > 0 ? (
                      lastResult.structuredReasons.map((r, i) => (
                        <div key={i} className="text-xs flex items-start gap-2 bg-surface p-2 rounded border border-border/70">
                          <span className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0',
                            r.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' :
                            r.severity === 'MED' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          )}>
                            {r.severity}
                          </span>
                          <span className="text-text-primary leading-tight">{r.message}</span>
                        </div>
                      ))
                    ) : lastResult.reasons && lastResult.reasons.length > 0 ? (
                      lastResult.reasons.map((r, i) => (
                        <div key={i} className="text-xs text-text-primary bg-surface p-2 rounded border border-border/70">
                          {r}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-text-secondary italic py-2">
                        No anomalous risk rules triggered. Clean transaction pattern.
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Contributing Factors */}
                <div className="bg-surface-raised p-4 rounded-xl border border-border">
                  <div className="text-xs uppercase tracking-wider text-text-secondary font-semibold mb-2">
                    Top Contributing Factors
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {lastResult.topFactors && lastResult.topFactors.length > 0 ? (
                      lastResult.topFactors.map((f, i) => {
                        const factorName = f.feature || f.factor || `Factor ${i + 1}`;
                        const factorVal = f.value || f.description || '';
                        const isRiskIncrease = f.impact === 'INCREASES_RISK';
                        const score = f.importance ?? f.impactScore ?? 0.5;
                        return (
                          <div key={i} className="text-xs bg-surface p-2 rounded border border-border/70 space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-text-primary">{factorName}</span>
                              <span className={cn('text-[10px] font-mono', isRiskIncrease ? 'text-rose-400' : 'text-emerald-400')}>
                                {isRiskIncrease ? '▲ RISK' : '▼ MITIGATING'}
                              </span>
                            </div>
                            <div className="text-[11px] text-text-secondary truncate">{factorVal}</div>
                            <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden">
                              <div
                                className={cn('h-full', isRiskIncrease ? 'bg-rose-500' : 'bg-emerald-500')}
                                style={{ width: `${Math.min(100, Math.max(10, score * 100))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-text-secondary italic py-2">
                        Baseline spending profile. No outlying feature weights.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Recent Evaluations List */}
        {recentEvaluations.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-6 font-mono text-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                <History className="w-4 h-4 text-accent" />
                Recent Simulator Evaluations ({recentEvaluations.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecentEvaluations([])}
                className="text-xs text-text-secondary hover:text-text-primary"
              >
                Clear History
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-raised text-text-secondary uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Decision</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentEvaluations.map((ev) => {
                    const badge = getDecisionBadge(ev.decision || '', ev.riskLevel);
                    return (
                      <tr
                        key={ev.transactionId}
                        className="hover:bg-surface-raised/60 cursor-pointer transition-colors"
                        onClick={() => {
                          setLastResult(ev);
                          setSelectedTransaction(ev);
                        }}
                      >
                        <td className="py-2 px-3 font-mono font-medium text-text-primary">{ev.transactionId}</td>
                        <td className="py-2 px-3 text-text-secondary">{ev.userId}</td>
                        <td className="py-2 px-3 text-text-primary font-mono">${ev.amount.toFixed(2)}</td>
                        <td className="py-2 px-3 text-text-secondary">{ev.merchantCategory}</td>
                        <td className="py-2 px-3">
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border', badge.bg)}>
                            {badge.text}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={cn(
                            'text-[11px] font-semibold',
                            ev.riskLevel === 'HIGH' ? 'text-rose-400' :
                            ev.riskLevel === 'MEDIUM' ? 'text-amber-400' :
                            'text-emerald-400'
                          )}>
                            {ev.riskLevel}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold">
                          {Math.round((ev.finalScore ?? ev.fraudProbability) * 100)}%
                        </td>
                        <td className="py-2 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLastResult(ev);
                              setSelectedTransaction(ev);
                            }}
                            className="text-xs py-1 px-2 h-auto text-accent hover:text-accent-hover"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SimulatorPage;
