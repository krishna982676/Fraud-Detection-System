import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SimulatorPage } from '../features/app/SimulatorPage';
import * as transactionsApi from '../api/transactions';
import type { AnalysisResponse } from '../types/api';

vi.mock('../api/transactions', () => ({
  analyzeTransaction: vi.fn(),
  getRecentTransactions: vi.fn(),
  getUserDetail: vi.fn(),
  getSystemStats: vi.fn(),
}));

const mockSuccessResponse: AnalysisResponse = {
  transactionId: 'TXN-SIM-001',
  userId: 'USER-1020',
  amount: 4200.0,
  merchantCategory: 'LUXURY',
  location: 'DUBAI',
  deviceType: 'WEB',
  riskLevel: 'HIGH',
  decision: 'BLOCK',
  fraudProbability: 0.88,
  finalScore: 0.88,
  mlScore: 0.92,
  ruleScore: 0.80,
  isFraud: true,
  timestamp: new Date().toISOString(),
  reasons: ['High value nocturnal transfer', 'Cross-border activity'],
  structuredReasons: [
    {
      code: 'NOCTURNAL_TXN',
      message: 'High value nocturnal transfer',
      severity: 'HIGH',
    },
  ],
  topFactors: [
    {
      feature: 'Transaction Amount',
      importance: 0.85,
      impact: 'INCREASES_RISK',
      value: '$4,200.00 (Outlier)',
    },
  ],
  modelVersion: 'RandomForest (v2.0)',
  thresholdUsed: 0.20,
  latencyMs: 18,
};

describe('SimulatorPage - Single-Payload Risk Evaluation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <HelmetProvider>
        <BrowserRouter>
          <SimulatorPage />
        </BrowserRouter>
      </HelmetProvider>
    );

  it('evaluates risk successfully and renders complete result panel', async () => {
    vi.mocked(transactionsApi.analyzeTransaction).mockResolvedValueOnce(mockSuccessResponse);

    renderComponent();

    // Click "Midnight Luxury Attack" preset
    const presetBtn = screen.getByRole('radio', { name: /Midnight Luxury Attack/i });
    fireEvent.click(presetBtn);

    // Click Evaluate Risk
    const evaluateBtn = screen.getByRole('button', { name: /Evaluate Risk/i });
    fireEvent.click(evaluateBtn);

    // Verify API called
    await waitFor(() => {
      expect(transactionsApi.analyzeTransaction).toHaveBeenCalledTimes(1);
    });

    // Verify Result Panel renders
    expect(await screen.findByText(/DECISION: BLOCK/i)).toBeInTheDocument();
    expect(screen.getAllByText(/88%/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/High value nocturnal transfer/i)).toBeInTheDocument();
    expect(screen.getByText(/Transaction Amount/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Simulator Evaluations/i)).toBeInTheDocument();
  });

  it('displays inline validation error and prevents API call when amount is zero or negative', async () => {
    renderComponent();

    const amountInput = screen.getByLabelText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '0' } });

    const evaluateBtn = screen.getByRole('button', { name: /Evaluate Risk/i });
    fireEvent.click(evaluateBtn);

    // Inline validation error should appear
    expect(await screen.findByText(/Amount must be greater than zero/i)).toBeInTheDocument();
    expect(transactionsApi.analyzeTransaction).not.toHaveBeenCalled();
  });

  it('displays error banner with retry option on API failure', async () => {
    vi.mocked(transactionsApi.analyzeTransaction).mockRejectedValueOnce(
      new Error('Backend service unavailable')
    );

    renderComponent();

    const evaluateBtn = screen.getByRole('button', { name: /Evaluate Risk/i });
    fireEvent.click(evaluateBtn);

    // Error banner appears
    expect(await screen.findByText(/Evaluation Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend service unavailable/i)).toBeInTheDocument();

    // Retry path
    vi.mocked(transactionsApi.analyzeTransaction).mockResolvedValueOnce(mockSuccessResponse);
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(transactionsApi.analyzeTransaction).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText(/DECISION: BLOCK/i)).toBeInTheDocument();
  });
});
