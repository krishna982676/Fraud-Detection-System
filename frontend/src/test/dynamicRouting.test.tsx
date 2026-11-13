import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { routeConfig } from '../routes/AppRoutes';
import { clearSession, saveSession } from '../store/authStore';
import * as transactionsApi from '../api/transactions';

vi.mock('../api/transactions', () => ({
  analyzeTransaction: vi.fn(),
  getRecentTransactions: vi.fn().mockResolvedValue({ content: [] }),
  getUserDetail: vi.fn().mockResolvedValue({
    userId: 'USER-100',
    avgAmount: 50.0,
    homeLocation: 'NEW_YORK',
    totalTransactions: 10,
    commonHours: [12, 14, 18],
  }),
  getTransactionById: vi.fn().mockImplementation((id: string) =>
    Promise.resolve({
      transactionId: id,
      userId: 'USER-ROUTED',
      amount: 450.0,
      merchantCategory: 'LUXURY',
      location: 'DUBAI',
      riskLevel: 'HIGH',
      decision: 'BLOCK',
      fraudProbability: 0.85,
      finalScore: 0.85,
      isFraud: true,
      timestamp: new Date().toISOString(),
      structuredReasons: [],
    })
  ),
  getSystemStats: vi.fn().mockResolvedValue({
    totalTransactions: 100,
    fraudTransactions: 5,
    legitTransactions: 95,
    fraudRatePercentage: 5.0,
    deltaFraudRate: 0.1,
    activeThreshold: 0.7,
    openAlertsCount: 2,
    totalAlertsCount: 10,
    escalatedAlertsCount: 1,
    alertsLastHour: 2,
    reviewedAlertsCount: 6,
    dismissedAlertsCount: 2,
  }),
}));

vi.mock('../api/alerts', () => ({
  getAlerts: vi.fn().mockResolvedValue([]),
  getAlertById: vi.fn(),
  updateAlertStatus: vi.fn(),
  recordFeedback: vi.fn(),
}));

vi.mock('../api/model', () => ({
  getModelMetrics: vi.fn().mockResolvedValue({
    algorithm: 'RandomForest (50 trees)',
    accuracy: 0.95,
    precision: 0.88,
    recall: 0.65,
    f1: 0.74,
    rocAuc: 0.97,
  }),
  getThresholdSweep: vi.fn().mockResolvedValue([]),
  getModelVersions: vi.fn().mockResolvedValue([]),
  activateModelVersion: vi.fn(),
  trainModel: vi.fn(),
  retrainFromFeedback: vi.fn(),
}));

describe('Dynamic Routing & Back/Forward Architecture', () => {
  beforeEach(() => {
    clearSession();
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialEntries: string[]) => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries,
    });
    return render(
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    );
  };

  it('redirects unauthenticated user to login with ?next=<url> guard', async () => {
    renderWithRouter(['/app/operations']);

    // Should be redirected to /login?next=%2Fapp%2Foperations
    expect(await screen.findByText(/Terminal Access/i)).toBeInTheDocument();
    expect(screen.getByText(/Analyst Identity/i)).toBeInTheDocument();
  });

  it('restores exact query param state on transactions page', async () => {
    saveSession({
      username: 'analyst@sentinelx.io',
      role: 'ANALYST',
      token: 'valid_token',
      loginTime: new Date().toISOString(),
    });

    renderWithRouter(['/app/transactions?risk=HIGH&search=alice']);

    expect(await screen.findByText(/Live Ingestion Pipeline/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Filter by transaction/i) as HTMLInputElement;
    expect(searchInput.value).toBe('alice');

    const riskSelect = screen.getByDisplayValue(/HIGH Risk/i) as HTMLSelectElement;
    expect(riskSelect.value).toBe('HIGH');
  });

  it('opens transaction detail drawer when navigating to /app/transactions/:txnId route', async () => {
    saveSession({
      username: 'analyst@sentinelx.io',
      role: 'ANALYST',
      token: 'valid_token',
      loginTime: new Date().toISOString(),
    });

    renderWithRouter(['/app/transactions/TXN-ROUTER-999']);

    // Drawer opens with transaction id from route
    const matches = await screen.findAllByText(/TXN-ROUTER-999/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText(/Composite Risk Score/i)).toBeInTheDocument();
    expect(screen.getAllByText(/USER-ROUTED/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders styled 404 route not found page for nonexistent URLs', async () => {
    renderWithRouter(['/nonexistent-firewall-breach']);

    expect(await screen.findByText(/404 \/\/ ROUTE NOT FOUND/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Surface/i)).toBeInTheDocument();
  });
});
