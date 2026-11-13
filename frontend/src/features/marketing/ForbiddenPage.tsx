import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BRAND } from '../../config/brand';

export const ForbiddenPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>{BRAND.name} // 403 Access Denied</title>
      </Helmet>
      <div className="min-h-screen bg-base flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-surface border border-border rounded-xl p-8 shadow-2xl font-mono text-center">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">403 // NOT ALLOWED</h1>
          <p className="text-xs text-text-muted mb-6 leading-relaxed">
            ERR_PERMISSION_DENIED: Your current analyst session clearance does not permit administrative access to this security perimeter.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/app/operations">
              <Button variant="primary" size="sm">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Return to Operations
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Re-authenticate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForbiddenPage;

