import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/marketing/Navbar';
import { Footer } from '../../components/marketing/Footer';

export const MarketingLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-base text-text-primary selection:bg-cyber-green selection:text-base relative">
      <Navbar />
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

