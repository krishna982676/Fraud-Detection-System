import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Terminal, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BRAND } from '../../config/brand';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>{BRAND.name} // 404 Route Not Found</title>
      </Helmet>
      <div className="min-h-screen bg-base flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-surface border border-border rounded-xl p-8 shadow-2xl font-mono text-center">
          <div className="w-12 h-12 rounded-xl bg-semantic-high/10 border border-semantic-high/30 text-semantic-high flex items-center justify-center mx-auto mb-4">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">404 // ROUTE NOT FOUND</h1>
          <p className="text-xs text-text-muted mb-6 leading-relaxed">
            ERR_GATEWAY_TRAVERSAL: The targeted security route does not exist or has been relocated behind defense firewalls.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="sm">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Return to Surface
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="outline" size="sm">
                Analyst Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

