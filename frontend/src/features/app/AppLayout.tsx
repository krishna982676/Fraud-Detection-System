import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../../components/app/AppSidebar';
import { AppHeader } from '../../components/app/AppHeader';
import { TransactionDrawer } from '../../components/app/TransactionDrawer';
import { useTransactionStore } from '../../store/transactionStore';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [accent, setAccent] = useState<'green' | 'teal'>('green');
  const { selectedTxn, setSelectedTransaction } = useTransactionStore();

  return (
    <div className={`min-h-screen flex bg-base text-text-primary selection:bg-cyber-${accent} selection:text-base`}>
      {/* Collapsible Left Cyber Sidebar */}
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader accent={accent} onToggleAccent={setAccent} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Slide-over Transaction Detail Drawer */}
      <TransactionDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

