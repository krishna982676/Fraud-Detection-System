import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Lock, User, Terminal, Play, Pause, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BRAND } from '../../config/brand';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('analyst@sentinelx.io');
  const [password, setPassword] = useState('demo-access-2026');
  const [error, setError] = useState<string | null>(null);
  const [isMatrixPaused, setIsMatrixPaused] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If already authenticated, redirect to ?next or /app/operations
  useEffect(() => {
    if (isAuthenticated) {
      const searchParams = new URLSearchParams(location.search);
      const nextParam = searchParams.get('next');
      const from = nextParam || (location.state as any)?.from?.pathname || '/app/operations';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.search, location.state]);

  // Matrix Rain Canvas Animation (pausable, reduced-motion safe)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const chars = '0123456789ABCDEF01010101XYZSENTINELX';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    let animationId: number;

    const render = () => {
      if (isMatrixPaused) return;

      ctx.fillStyle = 'rgba(5, 8, 6, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00FF9C';
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 400;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMatrixPaused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Username or email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
      login(username, 'ANALYST');
      toast.success('Terminal session authenticated.');
      const searchParams = new URLSearchParams(location.search);
      const nextParam = searchParams.get('next');
      const from = nextParam || (location.state as any)?.from?.pathname || '/app/operations';
      navigate(from, { replace: true });
    } catch {
      setError('Authentication failed. Check credentials.');
    }
  };

  return (
    <>
      <Helmet>
        <title>{BRAND.name} // Analyst Terminal Authentication</title>
      </Helmet>

      <div className="min-h-screen bg-base flex items-center justify-center p-4 selection:bg-accent selection:text-accent-contrast">
        <div className="w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left: Matrix Rain Canvas */}
          <div className="relative hidden md:block bg-[#050806] border-r border-border overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 z-10">
              <Link to="/" className="flex items-center gap-2 text-text-primary">
                <div className="w-7 h-7 rounded bg-cyber-green-dim border border-accent/50 flex items-center justify-center text-accent">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs font-bold">{BRAND.name}.AI</span>
              </Link>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 bg-surface/95 backdrop-blur-md border border-border-strong rounded-xl p-4">
              <div className="text-xs font-mono text-accent uppercase tracking-wider mb-1 flex items-center justify-between font-bold">
                <span>// RESTRICTED ACCESS AREA</span>
                <button
                  type="button"
                  onClick={() => setIsMatrixPaused(!isMatrixPaused)}
                  className="p-1 rounded text-text-secondary hover:text-text-primary"
                  title="Pause Matrix Animation"
                  aria-label="Pause Matrix Animation"
                >
                  {isMatrixPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-text-secondary leading-snug">
                Authorized financial defense personnel only. All session actions and scoring threshold alterations are logged.
              </p>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6 md:hidden">
                <div className="w-7 h-7 rounded bg-cyber-green-dim border border-accent/50 flex items-center justify-center text-accent">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-mono text-sm font-bold text-text-primary">{BRAND.name}.AI</span>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2 font-mono">
                  <Terminal className="w-5 h-5 text-accent" />
                  Terminal Access
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Authenticate your cryptographic security credentials to enter the analyst console.
                </p>
              </div>

              {error && (
                <div className="p-3 mb-6 rounded-lg bg-semantic-high/15 border border-semantic-high/40 text-semantic-high text-xs flex items-center gap-2 font-mono font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Analyst Identity"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="analyst@domain.com"
                  icon={<User className="w-4 h-4 text-text-secondary" />}
                  autoFocus
                />

                <Input
                  label="Access Passkey"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  icon={<Lock className="w-4 h-4 text-text-secondary" />}
                />

                <div className="text-xs font-mono text-text-secondary bg-surface-raised p-3 rounded-lg border border-border">
                  <span className="text-accent font-bold">DEMO CREDENTIALS:</span> Any username and password will grant read/write analyst clearance.
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                  Initialize Console Session &rarr;
                </Button>
              </form>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary font-medium">
              <Link to="/" className="hover:text-accent transition-colors">
                &larr; Return to Public Site
              </Link>
              <Link to="/demo" className="hover:text-accent-teal transition-colors">
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
