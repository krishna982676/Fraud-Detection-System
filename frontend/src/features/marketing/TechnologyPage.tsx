import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layers, AlertTriangle } from 'lucide-react';
import { getModelMetrics } from '../../api/model';
import type { ModelMetricsDto } from '../../types/api';
import { TECHNOLOGY_CONTENT } from '../../content/technology';
import { BRAND } from '../../config/brand';

export const TechnologyPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetricsDto | null>(null);

  useEffect(() => {
    async function fetchBenchmark() {
      try {
        const data = await getModelMetrics();
        setMetrics(data);
      } catch {
        // use baseline data
      }
    }
    fetchBenchmark();
  }, []);

  return (
    <>
      <Helmet>
        <title>{BRAND.name} // Technology & ML Pipeline</title>
        <meta
          name="description"
          content="Deep dive into the SentinelX hybrid fraud engine: Random Forest ensemble, geodesic speed limits, and 10-fold cross validation."
        />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Page Hero */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-teal/15 border border-accent-teal/40 text-accent-teal text-xs font-mono mb-4 font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>{TECHNOLOGY_CONTENT.header.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary mb-6">
            {TECHNOLOGY_CONTENT.header.title}
          </h1>
          <p className="text-base text-text-secondary leading-relaxed">
            {TECHNOLOGY_CONTENT.header.subtitle}
          </p>
        </div>

        {/* 1. ARCHITECTURE DIAGRAM (ORIGINAL SVG) */}
        <section className="mb-20">
          <div className="border border-border rounded-2xl bg-surface p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-text-primary font-mono">
                  // Complete System Architecture &amp; Data Flow
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Synchronous scoring path (&lt;5ms) coupled with asynchronous STOMP WebSocket broadcast.
                </p>
              </div>
              <span className="text-xs font-mono text-accent bg-accent/15 px-2.5 py-1 rounded-full border border-accent/40 font-bold">
                P99 &lt; 4.2ms
              </span>
            </div>

            {/* Architectural Flowchart SVG */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 920 320" className="w-full min-w-[700px] h-auto">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#00FF9C" />
                  </marker>
                </defs>

                {/* Layer 1: Client Gateway */}
                <rect x="20" y="40" width="180" height="240" rx="12" fill="#0D1610" stroke="#2A4033" strokeWidth="1.5" />
                <text x="40" y="70" fill="#00E5FF" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">01. INGESTION</text>
                <rect x="35" y="95" width="150" height="50" rx="8" fill="#14221A" stroke="#2A4033" />
                <text x="45" y="120" fill="#E8FFF3" fontSize="11" fontFamily="Space Grotesk" fontWeight="600">REST API (/analyze)</text>
                <text x="45" y="134" fill="#A7C4B3" fontSize="9" fontFamily="JetBrains Mono">JSON Schema Validation</text>

                <rect x="35" y="160" width="150" height="50" rx="8" fill="#14221A" stroke="#2A4033" />
                <text x="45" y="185" fill="#E8FFF3" fontSize="11" fontFamily="Space Grotesk" fontWeight="600">WebSocket Stream</text>
                <text x="45" y="199" fill="#A7C4B3" fontSize="9" fontFamily="JetBrains Mono">STOMP / SockJS</text>

                <rect x="35" y="225" width="150" height="40" rx="8" fill="#14221A" stroke="#2A4033" />
                <text x="45" y="249" fill="#A7C4B3" fontSize="10" fontFamily="JetBrains Mono">Rate Limiter &amp; Token Auth</text>

                {/* Connecting Arrow 1 */}
                <line x1="200" y1="160" x2="250" y2="160" stroke="#00FF9C" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Layer 2: Feature Engineering & Profiling */}
                <rect x="260" y="40" width="200" height="240" rx="12" fill="#0D1610" stroke="#2A4033" strokeWidth="1.5" />
                <text x="280" y="70" fill="#00FF9C" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">02. BEHAVIORAL PROFILE</text>
                <rect x="275" y="95" width="170" height="45" rx="8" fill="#14221A" stroke="#2A4033" />
                <text x="285" y="118" fill="#E8FFF3" fontSize="11" fontFamily="Space Grotesk" fontWeight="600">UserProfileService</text>
                <text x="285" y="131" fill="#A7C4B3" fontSize="9" fontFamily="JetBrains Mono">Rolling Mean &amp; Variance (σ)</text>

                <rect x="275" y="150" width="170" height="45" rx="8" fill="#14221A" stroke="#2A4033" />
                <text x="285" y="173" fill="#E8FFF3" fontSize="11" fontFamily="Space Grotesk" fontWeight="600">Haversine Velocity</text>
                <text x="285" y="186" fill="#A7C4B3" fontSize="9" fontFamily="JetBrains Mono">Speed &gt; 900 km/h flag</text>

                <rect x="275" y="205" width="170" height="45" rx="8" fill="#14221A" stroke="#2A4033" />
                <text x="285" y="228" fill="#E8FFF3" fontSize="11" fontFamily="Space Grotesk" fontWeight="600">Velocity Burst Monitor</text>
                <text x="285" y="241" fill="#A7C4B3" fontSize="9" fontFamily="JetBrains Mono">10-Min Sliding Count</text>

                {/* Connecting Arrow 2 */}
                <line x1="460" y1="160" x2="510" y2="160" stroke="#00FF9C" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Layer 3: Hybrid Scoring Core */}
                <rect x="520" y="40" width="200" height="240" rx="12" fill="#0D1610" stroke="#00FF9C" strokeOpacity="0.6" strokeWidth="1.5" />
                <text x="540" y="70" fill="#00FF9C" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">03. HYBRID SYNTHESIS</text>
                
                <rect x="535" y="95" width="170" height="50" rx="8" fill="#14221A" stroke="#00FF9C" strokeOpacity="0.4" />
                <text x="545" y="118" fill="#00FF9C" fontSize="11" fontFamily="Space Grotesk" fontWeight="bold">RandomForest ML (70%)</text>
                <text x="545" y="134" fill="#A7C4B3" fontSize="9" fontFamily="JetBrains Mono">50 Trees • Resampled</text>

                <rect x="535" y="155" width="170" height="50" rx="8" fill="#14221A" stroke="#00E5FF" strokeOpacity="0.4" />
                <text x="545" y="178" fill="#00E5FF" fontSize="11" fontFamily="Space Grotesk" fontWeight="bold">RuleEngine (30%)</text>
                <text x="545" y="194" fill="#A7C4B3" fontSize="9" fontFamily="JetBrains Mono">Z-Score &amp; Impossible Travel</text>

                <rect x="535" y="215" width="170" height="45" rx="8" fill="#14221A" stroke="#2A4033" />
                <text x="545" y="238" fill="#E8FFF3" fontSize="11" fontFamily="Space Grotesk" fontWeight="600">Final Risk Synthesis</text>
                <text x="545" y="251" fill="#FFB020" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">Score: 0.00 &rarr; 1.00</text>

                {/* Connecting Arrow 3 */}
                <line x1="720" y1="160" x2="760" y2="160" stroke="#00FF9C" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Layer 4: Storage & Triage Dispatch */}
                <rect x="770" y="40" width="130" height="240" rx="12" fill="#0D1610" stroke="#2A4033" strokeWidth="1.5" />
                <text x="785" y="70" fill="#00E5FF" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">04. OUTPUT</text>
                
                <rect x="780" y="95" width="110" height="45" rx="8" fill="#14221A" stroke="#2A4033" />
                <text x="790" y="118" fill="#E8FFF3" fontSize="10" fontFamily="Space Grotesk">H2 / Postgres</text>
                <text x="790" y="131" fill="#A7C4B3" fontSize="8" fontFamily="JetBrains Mono">Immutable DB</text>

                <rect x="780" y="155" width="110" height="45" rx="8" fill="#14221A" stroke="#FF3B5C" strokeOpacity="0.5" />
                <text x="790" y="178" fill="#FF3B5C" fontSize="10" fontFamily="Space Grotesk" fontWeight="bold">Alert Feed</text>
                <text x="790" y="191" fill="#A7C4B3" fontSize="8" fontFamily="JetBrains Mono">5m Dedup Window</text>

                <rect x="780" y="215" width="110" height="45" rx="8" fill="#14221A" stroke="#2A4033" />
                <text x="790" y="238" fill="#00FF9C" fontSize="10" fontFamily="Space Grotesk" fontWeight="bold">Analyst UI</text>
                <text x="790" y="251" fill="#A7C4B3" fontSize="8" fontFamily="JetBrains Mono">Live Console</text>
              </svg>
            </div>
          </div>
        </section>

        {/* 2. MODEL COMPARISON BENCHMARK TABLE */}
        <section className="mb-20">
          <div className="border border-border rounded-2xl bg-surface p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
              <div>
                <h3 className="text-xl font-bold text-text-primary">
                  10-Fold Cross-Validation Benchmark
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Comparing RandomForest against J48 Decision Tree and Logistic Regression baseline on synthetic financial distributions.
                </p>
              </div>
              <span className="text-xs font-mono text-text-secondary">
                Trained at: {metrics?.trainedAt || 'System Init'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary uppercase text-xs font-semibold">
                    <th className="py-3 px-4">Metric</th>
                    <th className="py-3 px-4 text-accent font-bold">RandomForest (Primary)</th>
                    <th className="py-3 px-4">J48 Decision Tree</th>
                    <th className="py-3 px-4">Logistic Regression</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-3 px-4 text-text-primary font-medium">Overall Accuracy</td>
                    <td className="py-3 px-4 text-accent font-bold">
                      {metrics ? `${(metrics.accuracy * 100).toFixed(2)}%` : '99.42%'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineJ48Accuracy ? `${(metrics.baselineJ48Accuracy * 100).toFixed(2)}%` : '98.90%'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineLogisticAccuracy ? `${(metrics.baselineLogisticAccuracy * 100).toFixed(2)}%` : '98.15%'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-text-primary font-medium">Precision (Fraud Class)</td>
                    <td className="py-3 px-4 text-accent font-bold">
                      {metrics ? `${(metrics.precision * 100).toFixed(2)}%` : '85.86%'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineJ48Precision ? `${(metrics.baselineJ48Precision * 100).toFixed(2)}%` : '76.40%'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineLogisticPrecision ? `${(metrics.baselineLogisticPrecision * 100).toFixed(2)}%` : '61.20%'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-text-primary font-medium">Recall (Fraud Class)</td>
                    <td className="py-3 px-4 text-accent font-bold">
                      {metrics ? `${(metrics.recall * 100).toFixed(2)}%` : '85.00%'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineJ48Recall ? `${(metrics.baselineJ48Recall * 100).toFixed(2)}%` : '74.50%'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineLogisticRecall ? `${(metrics.baselineLogisticRecall * 100).toFixed(2)}%` : '58.70%'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-text-primary font-medium">F1-Score</td>
                    <td className="py-3 px-4 text-accent font-bold">
                      {metrics ? metrics.f1Score.toFixed(4) : '0.8543'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineJ48F1 ? metrics.baselineJ48F1.toFixed(4) : '0.7544'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineLogisticF1 ? metrics.baselineLogisticF1.toFixed(4) : '0.5992'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-text-primary font-medium">ROC-AUC</td>
                    <td className="py-3 px-4 text-accent-teal font-bold">
                      {metrics ? metrics.rocAuc.toFixed(4) : '0.9452'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineJ48RocAuc ? metrics.baselineJ48RocAuc.toFixed(4) : '0.8870'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {metrics?.baselineLogisticRocAuc ? metrics.baselineLogisticRocAuc.toFixed(4) : '0.8230'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. PIPELINE PHASES BREAKDOWN */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold text-text-primary mb-8">
            Pipeline Execution Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TECHNOLOGY_CONTENT.pipelinePhases.map((phase) => (
              <div key={phase.name} className="bg-surface border border-border rounded-xl p-6 hover:border-border-strong transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-text-primary">{phase.name}</h4>
                  <span className="text-xs font-mono text-accent bg-accent/15 border border-accent/40 px-2 py-0.5 rounded font-semibold">
                    {phase.metrics}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {phase.summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. DATASET & TRANSPARENT LIMITATIONS NOTE */}
        <section className="bg-surface-raised border border-semantic-medium/40 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 text-semantic-medium mb-4">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="text-base font-bold font-mono">
              {TECHNOLOGY_CONTENT.datasetNotes.title}
            </h4>
          </div>
          <ul className="space-y-3">
            {TECHNOLOGY_CONTENT.datasetNotes.points.map((p, idx) => (
              <li key={idx} className="text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                <span className="text-semantic-medium font-mono font-bold">&bull;</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};
