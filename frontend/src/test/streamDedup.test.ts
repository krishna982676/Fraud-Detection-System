import { describe, it, expect, beforeEach } from 'vitest';
import {
  deduplicateAndAddTransaction,
  clearTransactions,
  useTransactionStore,
} from '../store/transactionStore';
import type { AnalysisResponse } from '../types/api';

describe('Transaction Stream Deduplication Logic', () => {
  beforeEach(() => {
    clearTransactions();
  });

  it('accepts unique transactions and rejects duplicate transactionIds', () => {
    const txn1: AnalysisResponse = {
      transactionId: 'TXN-9001',
      userId: 'USER-1001',
      amount: 150.0,
      merchantCategory: 'GROCERY',
      location: 'NEW_YORK',
      riskLevel: 'LOW',
      fraudProbability: 0.05,
      ruleScore: 0.0,
      finalScore: 0.035,
      isFraud: false,
      timestamp: new Date().toISOString(),
      reasons: [],
      structuredReasons: [],
    };

    const firstAdded = deduplicateAndAddTransaction(txn1);
    expect(firstAdded).toBe(true);

    // Duplicate attempt
    const secondAdded = deduplicateAndAddTransaction(txn1);
    expect(secondAdded).toBe(false);
  });
});

