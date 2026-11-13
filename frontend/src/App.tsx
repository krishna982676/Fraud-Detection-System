import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { routeConfig } from './routes/AppRoutes';

const router = createBrowserRouter(routeConfig);

export const App: React.FC = () => {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#0A100C',
            border: '1px solid #1A2B20',
            color: '#E6F5EC',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
          },
        }}
      />
    </HelmetProvider>
  );
};

export default App;
