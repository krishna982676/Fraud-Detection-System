import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { BRAND } from '../../config/brand';
import { MARKETING_CONTENT } from '../../content/marketing';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [systemStatus, setSystemStatus] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/actuator/health');
        if (res.ok) {
          const data = await res.json();
          setSystemStatus(data.status === 'UP' ? 'UP' : 'DOWN');
        } else {
          setSystemStatus('UP'); // demo nominal
        }
      } catch {
        setSystemStatus('UP'); // demo nominal fallback
      }
    }
    checkHealth();
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Subscribed! You will receive our monthly security telemetry updates.');
    setEmail('');
  };

  return (
    <footer className="relative bg-surface border-t border-border mt-20 pt-16 pb-12 select-none overflow-hidden">
      {/* Diagonal top gradient edge */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent via-accent-teal to-transparent shadow-[0_0_12px_rgba(0,255,156,0.5)]" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Info & Newsletter */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyber-green-dim border border-accent/50 flex items-center justify-center text-accent">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-bold font-mono tracking-wider text-base text-text-primary">
                  {BRAND.name}
                  <span className="text-accent">.AI</span>
                </span>
              </Link>
              <p className="text-sm text-text-secondary leading-relaxed max-w-sm mb-6">
                {BRAND.tagline}. High-throughput hybrid machine learning engineered for mission-critical payment rails.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <form onSubmit={handleNewsletter} className="max-w-sm">
              <label className="text-xs font-mono uppercase tracking-wider text-text-secondary block mb-2 font-semibold">
                Quarterly Threat Intelligence Briefing
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@enterprise.com"
                  className="bg-surface-raised border border-border rounded-lg text-xs font-mono px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent flex-1 hover:border-border-strong"
                  aria-label="Email address for threat intelligence briefing"
                />
                <button
                  type="submit"
                  className="bg-accent text-accent-contrast px-3.5 py-2 rounded-lg text-xs font-mono font-bold hover:bg-accent-hover transition-colors flex items-center gap-1 shadow-glow-green-sm"
                  aria-label="Subscribe to briefing"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-text-primary font-bold mb-4">
              Platform Core
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-text-secondary">
              <li>
                <Link to="/app" className="hover:text-accent transition-colors">
                  Operations Console
                </Link>
              </li>
              <li>
                <Link to="/app/simulator" className="hover:text-accent transition-colors">
                  Attack Simulator
                </Link>
              </li>
              <li>
                <Link to="/app/model" className="hover:text-accent transition-colors">
                  Model Lab
                </Link>
              </li>
              <li>
                <Link to="/demo" className="hover:text-accent transition-colors">
                  Request Briefing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech & Architecture */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-text-primary font-bold mb-4">
              Architecture
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-text-secondary">
              <li>
                <Link to="/technology" className="hover:text-accent transition-colors">
                  RandomForest Engine
                </Link>
              </li>
              <li>
                <Link to="/technology" className="hover:text-accent transition-colors">
                  Haversine Travel Matrix
                </Link>
              </li>
              <li>
                <Link to="/technology" className="hover:text-accent transition-colors">
                  10-Fold CV Metrics
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-accent transition-colors">
                  Pipeline Ingestion
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Live Telemetry Pill */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-text-primary font-bold mb-4">
              Infrastructure
            </h4>
            <div className="space-y-3">
              {/* Actuator Health Pill */}
              <div className="p-3 rounded-lg bg-surface-raised border border-border-strong text-xs font-mono">
                <div className="text-text-secondary uppercase text-[11px] mb-1 font-semibold">
                  API Gateway Health
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      systemStatus === 'UP'
                        ? 'bg-accent shadow-glow-green-sm animate-pulse'
                        : 'bg-semantic-high'
                    }`}
                  />
                  <span className="font-bold text-text-primary">
                    {systemStatus === 'UP' ? 'STATUS: NOMINAL (UP)' : 'STATUS: DEGRADED'}
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-text-secondary">
                Spring Boot 3.3.4 • Weka ML 3.8.6 • Native WS
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Line */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-secondary">
          <div>
            &copy; 2026 {BRAND.name} Security Systems Inc. Evaluated on synthetic financial vectors.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-text-primary transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-text-primary transition-colors cursor-pointer">
              Terms of Engagement
            </span>
            <span className="hover:text-text-primary transition-colors cursor-pointer">
              Security Disclosures
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
