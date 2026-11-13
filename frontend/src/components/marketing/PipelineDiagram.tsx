import React from 'react';
import { ShieldAlert, Activity, UserCheck, RefreshCw, Cpu, Database, Bell } from 'lucide-react';
import { GlowCard } from '../ui/GlowCard';
import { MARKETING_CONTENT } from '../../content/marketing';

export const PipelineDiagram: React.FC = () => {
  const { pipeline } = MARKETING_CONTENT;

  return (
    <section className="py-20 relative px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-green/40 bg-cyber-green/10 text-cyber-green text-xs font-mono uppercase tracking-widest mb-4">
          <Cpu className="w-3.5 h-3.5" />
          {pipeline.badge}
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-4">
          {pipeline.title}
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          {pipeline.subtitle}
        </p>
      </div>

      {/* SVG Pipeline Flow with Dual Learning Loop */}
      <div className="relative bg-surface/90 border border-border rounded-2xl p-6 sm:p-10 mb-12 shadow-2xl overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 matrix-grid-dense opacity-30 pointer-events-none" />

        {/* Dual Learning Loop Labels */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono tracking-widest text-cyber-teal/70 uppercase hidden sm:block">
          &larr; Continuous Learning Loop &larr;
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-mono tracking-widest text-cyber-green/70 uppercase hidden sm:block">
          &rarr; Continuous Learning Loop &rarr;
        </div>

        {/* 4 Pipeline Node Stages */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {pipeline.steps.map((step, idx) => (
            <div key={step.id} className="relative flex flex-col items-center text-center">
              {/* Node Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-cyber-green shadow-glow-green-sm mb-4 relative group hover:border-cyber-green transition-all">
                {idx === 0 && <Database className="w-6 h-6 text-cyber-green" />}
                {idx === 1 && <Activity className="w-6 h-6 text-cyber-teal" />}
                {idx === 2 && <Cpu className="w-6 h-6 text-cyber-green" />}
                {idx === 3 && <Bell className="w-6 h-6 text-semantic-high" />}

                {/* Step Index Badge */}
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-base border border-border text-[10px] font-mono font-bold text-text-muted flex items-center justify-center">
                  0{idx + 1}
                </span>
              </div>

              <h4 className="text-sm font-bold text-text-primary font-mono mb-2">
                {step.title}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                {step.desc}
              </p>

              {/* Connecting Arrow for desktop */}
              {idx < 3 && (
                <div className="hidden md:block absolute -right-3 top-7 text-cyber-green/40 font-mono text-sm">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4 Feature Cards Below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlowCard>
          <div className="w-10 h-10 rounded-lg bg-cyber-green/10 border border-cyber-green/30 text-cyber-green flex items-center justify-center mb-4">
            <Activity className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-text-primary mb-2">
            {pipeline.features[0].title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {pipeline.features[0].desc}
          </p>
        </GlowCard>

        <GlowCard glowColor="teal">
          <div className="w-10 h-10 rounded-lg bg-cyber-teal/10 border border-cyber-teal/30 text-cyber-teal flex items-center justify-center mb-4">
            <UserCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-text-primary mb-2">
            {pipeline.features[1].title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {pipeline.features[1].desc}
          </p>
        </GlowCard>

        <GlowCard>
          <div className="w-10 h-10 rounded-lg bg-cyber-green/10 border border-cyber-green/30 text-cyber-green flex items-center justify-center mb-4">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-text-primary mb-2">
            {pipeline.features[2].title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {pipeline.features[2].desc}
          </p>
        </GlowCard>

        <GlowCard glowColor="teal">
          <div className="w-10 h-10 rounded-lg bg-cyber-teal/10 border border-cyber-teal/30 text-cyber-teal flex items-center justify-center mb-4">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-text-primary mb-2">
            {pipeline.features[3].title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {pipeline.features[3].desc}
          </p>
        </GlowCard>
      </div>
    </section>
  );
};

