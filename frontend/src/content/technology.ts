export const TECHNOLOGY_CONTENT = {
  header: {
    badge: 'System Architecture & ML Internals',
    title: 'Hybrid Intelligence: Calibrated Random Forests + Deterministic Heuristics',
    subtitle:
      'Explore how SentinelX combines statistical machine learning with physical impossibility constraints to achieve >99% test accuracy with zero opaque decision black boxes.',
  },
  pipelinePhases: [
    {
      name: 'Phase 1: Feature Extraction & Geodesic Velocity',
      summary:
        'Every incoming request is parsed against the in-memory UserProfile cache. Haversine spherical distance is calculated against the previous known coordinate and timestamp.',
      metrics: 'Mean Latency: 0.8ms',
    },
    {
      name: 'Phase 2: Ensemble Inference (RandomForest 50 Trees)',
      summary:
        'A balanced 50-tree Random Forest evaluates normalized feature vectors (amount, hour, distance, category risk, velocity) outputting a calibrated fraud probability between 0.0 and 1.0.',
      metrics: 'Mean Latency: 2.1ms',
    },
    {
      name: 'Phase 3: Deterministic Rule Cross-Verification',
      summary:
        'Deterministic rules check hard constraints: Z-Score (>3.0σ), Impossible Travel (>900 km/h), Nocturnal Hour (01:00-05:00), and 24h Velocity Spike (>15 txns).',
      metrics: 'Rule Weight: 30%',
    },
    {
      name: 'Phase 4: Blended Risk Synthesis & Triage Dispatch',
      summary:
        'The final risk score = 0.70 * ML_Probability + 0.30 * Rule_Score. If finalScore >= 0.70, an alert is dispatched over WebSocket and deduplicated in a rolling 5-minute window.',
      metrics: 'Overall Latency: <4.2ms',
    },
  ],
  datasetNotes: {
    title: 'Dataset Formulation & Transparent Limitations',
    points: [
      'Trained on 20,000 realistic synthetic financial transactions generated using multi-modal Gaussian distributions with overlapping noise.',
      'Class imbalance (typically 2-5% real-world fraud) is compensated using Weka Resampling filters to prevent majority-class bias.',
      '10-Fold Cross-Validation ensures models generalize without memorizing transaction IDs or synthetic user keys.',
      'Notice: This environment is an analytical benchmark and simulation system. It is designed for architecture demonstration and defense research, not direct unmonitored production financial execution.',
    ],
  },
};

