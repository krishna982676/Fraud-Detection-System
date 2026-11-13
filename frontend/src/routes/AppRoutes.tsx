import React, { lazy, Suspense } from 'react';
import { RouteObject, Navigate, ScrollRestoration, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Skeleton } from '../components/ui/Skeleton';

// Code-split routes for optimal performance and lightweight initial bundles
const MarketingLayout = lazy(() =>
  import('../features/marketing/MarketingLayout').then((m) => ({ default: m.MarketingLayout }))
);
const HomePage = lazy(() =>
  import('../features/marketing/HomePage').then((m) => ({ default: m.HomePage }))
);
const TechnologyPage = lazy(() =>
  import('../features/marketing/TechnologyPage').then((m) => ({ default: m.TechnologyPage }))
);
const DemoPage = lazy(() =>
  import('../features/marketing/DemoPage').then((m) => ({ default: m.DemoPage }))
);
const LoginPage = lazy(() =>
  import('../features/app/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const NotFoundPage = lazy(() =>
  import('../features/marketing/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const ForbiddenPage = lazy(() =>
  import('../features/marketing/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage }))
);

// App routes
const AppLayout = lazy(() =>
  import('../features/app/AppLayout').then((m) => ({ default: m.AppLayout }))
);
const DashboardPage = lazy(() =>
  import('../features/app/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const TransactionsPage = lazy(() =>
  import('../features/app/TransactionsPage').then((m) => ({ default: m.TransactionsPage }))
);
const AlertsPage = lazy(() =>
  import('../features/app/AlertsPage').then((m) => ({ default: m.AlertsPage }))
);
const ModelLabPage = lazy(() =>
  import('../features/app/ModelLabPage').then((m) => ({ default: m.ModelLabPage }))
);
const SimulatorPage = lazy(() =>
  import('../features/app/SimulatorPage').then((m) => ({ default: m.SimulatorPage }))
);
const SettingsPage = lazy(() =>
  import('../features/app/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const DatasetIntelligencePage = lazy(() =>
  import('../features/app/DatasetIntelligencePage').then((m) => ({ default: m.DatasetIntelligencePage }))
);

export const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    <span className="font-mono text-xs text-text-secondary">Decrypting secure perimeter...</span>
  </div>
);

// Root Layout wrapping with ScrollRestoration and Suspense
const RootLayout: React.FC = () => {
  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
};

export const routeConfig: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        element: <MarketingLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/technology', element: <TechnologyPage /> },
          { path: '/demo', element: <DemoPage /> },
        ],
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/403',
        element: <ForbiddenPage />,
      },
      {
        path: '/app',
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/app/operations" replace /> },
          { path: 'operations', element: <DashboardPage /> },
          { path: 'dashboard', element: <Navigate to="/app/operations" replace /> },
          { path: 'transactions', element: <TransactionsPage /> },
          { path: 'transactions/:txnId', element: <TransactionsPage /> },
          { path: 'alerts', element: <AlertsPage /> },
          { path: 'alerts/:alertId', element: <AlertsPage /> },
          { path: 'model', element: <ModelLabPage /> },
          { path: 'model/:versionId', element: <ModelLabPage /> },
          { path: 'simulator', element: <SimulatorPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'datasets', element: <DatasetIntelligencePage /> },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];
