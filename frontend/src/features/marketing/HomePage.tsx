import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Terminal, Zap, CheckCircle2, Lock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/Button';
import { GlowCard } from '../../components/ui/GlowCard';
import { Accordion } from '../../components/ui/Accordion';
import { HeroIllustration } from '../../components/marketing/HeroIllustration';
import { LiveTicker } from '../../components/marketing/LiveTicker';
import { DiagonalDivider } from '../../components/marketing/DiagonalDivider';
import { PipelineDiagram } from '../../components/marketing/PipelineDiagram';
import { MetricsStrip } from '../../components/marketing/MetricsStrip';
import { MARKETING_CONTENT } from '../../content/marketing';
import { FAQ_CONTENT } from '../../content/faq';
import { BRAND } from '../../config/brand';

// Typing/Decoding text effect for hero keyword
function useDecodingText(target: string, duration = 1200) {
  const [text, setText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$&%';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setText(
        target
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return target[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= target.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, duration / (target.length * 2));

    return () => clearInterval(interval);
  }, [target, duration]);

  return text;
}

export const HomePage: React.FC = () => {
  const { hero, whySentinelX, caseStudy, techStack } = MARKETING_CONTENT;
  const decodedHighlight = useDecodingText(hero.titleHighlight);

  return (
    <>
      <Helmet>
        <title>{BRAND.name} // Real-Time Autonomous Fraud Intelligence</title>
        <meta name="description" content={hero.subheading} />
      </Helmet>

      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 px-4 max-w-6xl mx-auto overflow-hidden scanlines-overlay">
        {/* Subtle grid background */}
        <div className="absolute inset-0 matrix-grid-bg opacity-30 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-raised border border-accent/40 text-accent text-xs font-mono mb-6 shadow-glow-green-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>{hero.eyebrow}</span>
            </div>

            {/* H1 with Gradient & Decoding Effect */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.1] mb-6">
              {hero.titlePrefix}{' '}
              <span className="bg-gradient-to-r from-accent via-accent-hover to-accent-teal bg-clip-text text-transparent font-mono">
                {decodedHighlight || hero.titleHighlight}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl mb-8">
              {hero.subheading}
            </p>

            {/* Two CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/app">
                <Button variant="primary" size="lg">
                  <Terminal className="w-4 h-4 mr-2" />
                  {hero.primaryCta}
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  How It Works &darr;
                </Button>
              </a>
            </div>

            {/* Micro trust indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-mono text-text-secondary font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                Sub-5ms Evaluation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal" />
                Explainable Decisions
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-accent" />
                Zero Black-Box Bias
              </span>
            </div>
          </div>

          {/* Right Column: Original Isometric Illustration */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Live Mini Ticker */}
      <LiveTicker />

      {/* Diagonal Divider */}
      <DiagonalDivider />

      {/* 2. "WHAT WE DO" PIPELINE FLOW */}
      <div id="how-it-works">
        <PipelineDiagram />
      </div>

      {/* Diagonal Divider Reverse */}
      <DiagonalDivider reverse />

      {/* 3. "WHY SENTINELX" DARK SECTION */}
      <section className="py-20 px-4 max-w-6xl mx-auto relative select-none">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
            // Core Architecture Strengths
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-2 mb-4">
            {whySentinelX.title}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {whySentinelX.subtitle}
          </p>
        </div>

        {/* 4 Glow Cards Surrounding Central Glowing Orb */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Center Glowing Logo Orb for desktop */}
          <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-surface-raised border border-accent/50 items-center justify-center shadow-glow-green-lg z-20 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center text-accent">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          {whySentinelX.pillars.map((pillar, idx) => (
            <GlowCard key={pillar.title} glowColor={idx % 2 === 0 ? 'green' : 'teal'}>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border-strong flex items-center justify-center text-accent font-mono font-bold text-xs shrink-0">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="text-base font-bold text-text-primary mb-1">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* 4. LIVE METRICS STRIP (COUNT-UP) */}
      <MetricsStrip />

      {/* 5. CASE STUDY / "HOW IT WORKS" BLOCK */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="bg-surface border border-border rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Graphic Card */}
            <div className="lg:col-span-5 bg-surface-raised border border-border-strong rounded-xl p-6 relative">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <span className="text-xs font-mono text-accent-teal uppercase tracking-wider font-semibold">
                  {caseStudy.tag}
                </span>
                <span className="text-xs font-mono text-semantic-high bg-semantic-high/15 border border-semantic-high/40 px-2.5 py-0.5 rounded-full font-bold">
                  INTERCEPTED
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Attack Vector:</span>
                  <span className="text-text-primary font-semibold">Multi-City Card Testing</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Velocity Trigger:</span>
                  <span className="text-semantic-high font-bold">&gt; 3,200 km/h</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Scoring Latency:</span>
                  <span className="text-accent font-bold">3.2 ms</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Risk Score:</span>
                  <span className="text-semantic-high font-bold">0.94 [HIGH]</span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-border text-xs text-text-secondary leading-relaxed">
                Automated 5-minute deduping consolidated 14 rapid bot charges into 1 actionable alert.
              </div>
            </div>

            {/* Right Narrative */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <span className="text-xs font-mono text-accent uppercase tracking-wider mb-2 font-semibold">
                // Empirical Defense Incident
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                {caseStudy.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                {caseStudy.scenario}
              </p>
              <ul className="space-y-3 mb-8 w-full">
                {caseStudy.results.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-xs text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Link to="/technology">
                <Button variant="outline" size="md">
                  {caseStudy.ctaText} &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TECH STACK STRIP */}
      <section className="py-14 border-t border-border bg-surface/40">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="text-xs font-mono text-text-secondary uppercase tracking-wider font-semibold">
            {techStack.subtitle}
          </span>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 sm:gap-10">
            {techStack.technologies.map((t) => (
              <div
                key={t.name}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-raised border border-border-strong text-text-secondary hover:text-accent hover:border-accent/40 transition-all select-none"
              >
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-mono font-bold text-text-primary">{t.name}</span>
                <span className="text-xs text-text-secondary">({t.role})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-accent-teal uppercase tracking-widest font-semibold">
            // Technical Clarifications
          </span>
          <h2 className="text-3xl font-bold text-text-primary mt-2 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-text-secondary">
            Everything you need to know about model calibration, data isolation, and low-latency execution.
          </p>
        </div>

        <Accordion items={FAQ_CONTENT} />

        <div className="mt-12 text-center">
          <p className="text-sm text-text-secondary mb-4">
            Need custom risk rules or enterprise high-availability deployment?
          </p>
          <Link to="/demo">
            <Button variant="primary" size="md">
              Speak with Security Engineering &rarr;
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};
