export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StructuredReason {
  code: string;
  message: string;
  severity: 'LOW' | 'MED' | 'HIGH';
}

export interface TopFactor {
  feature?: string;
  factor?: string;
  importance?: number;
  impactScore?: number;
  impact?: 'INCREASES_RISK' | 'DECREASES_RISK' | string;
  value?: string;
  description?: string;
}

export interface ScoreBreakdown {
  mlScore: number;
  ruleScore: number;
  finalScore: number;
  riskLevel: RiskLevel;
}

export interface TransactionRequest {
  transactionId?: string;
  userId: string;
  amount: number;
  merchantCategory: string;
  location: string;
  deviceType: string;
  hourOfDay: number;
  distanceFromHome: number;
  txnCountLast24h: number;
  isInternational: boolean;
  timestamp?: string;
  paymentMethod?: string;
  previousFraudulentTransactions?: number;
  accountAge?: number;
}

export interface AnalysisResponse {
  transactionId: string;
  userId: string;
  amount: number;
  merchantCategory: string;
  location: string;
  deviceType?: string;
  riskLevel: RiskLevel;
  decision?: 'APPROVE' | 'REVIEW' | 'BLOCK' | string;
  fraudProbability: number;
  ruleScore?: number;
  mlScore?: number;
  finalScore: number;
  isFraud: boolean;
  timestamp: string;
  reasons: string[];
  structuredReasons: StructuredReason[];
  scoreBreakdown?: ScoreBreakdown;
  topFactors?: TopFactor[];
  alertGenerated?: boolean;
  alertId?: number | null;
  modelVersion?: string;
  thresholdUsed?: number;
  latencyMs?: number;
}

export type AlertStatus = 'OPEN' | 'REVIEWED' | 'DISMISSED' | 'ESCALATED';

export interface Alert {
  id: number;
  transactionId: string;
  userId: string;
  amount: number;
  merchantCategory: string;
  location: string;
  riskLevel: RiskLevel;
  fraudProbability: number;
  ruleScore: number;
  finalScore: number;
  status: AlertStatus;
  reasons: string;
  eventCount: number;
  mergedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModelMetricsDto {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  f1?: number;
  rocAuc: number;
  modelType: string;
  algorithm?: string;
  trainedAt: string;
  decisionThreshold?: number;
  datasetRows?: number;
  featureImportances?: Record<string, number>;
  baselineJ48Accuracy?: number;
  baselineJ48Precision?: number;
  baselineJ48Recall?: number;
  baselineJ48F1?: number;
  baselineJ48RocAuc?: number;
  baselineLogisticAccuracy?: number;
  baselineLogisticPrecision?: number;
  baselineLogisticRecall?: number;
  baselineLogisticF1?: number;
  baselineLogisticRocAuc?: number;
  confusionMatrix?: number[][];
  classNames?: string[];
}

export interface ThresholdSweepDto {
  threshold: number;
  precision: number;
  recall: number;
  f1Score: number;
  f1?: number;
}

export interface SystemStatsDto {
  totalTransactions: number;
  fraudTransactions: number;
  legitTransactions: number;
  fraudRatePercentage: number;
  deltaFraudRate: number;
  activeThreshold: number;
  openAlertsCount: number;
  totalAlertsCount: number;
  escalatedAlertsCount: number;
  alertsLastHour: number;
  reviewedAlertsCount: number;
  dismissedAlertsCount: number;
}

export interface UserProfileDto {
  userId: string;
  totalTransactions: number;
  meanAmount: number;
  stdDevAmount: number;
  frequentCities: string[];
  frequentCategories: string[];
  lastKnownCity?: string;
  lastKnownTimestamp?: string;
}

export interface UserDetailResponse {
  profile?: UserProfileDto;
  recentTransactions?: AnalysisResponse[];
  userId?: string;
  avgAmount?: number;
  homeLocation?: string;
  totalTransactions?: number;
  commonHours?: number[];
}

export interface DemoRequestPayload {
  firstName: string;
  lastName: string;
  businessEmail: string;
  company: string;
  interest: string;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

