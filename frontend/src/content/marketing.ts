export const MARKETING_CONTENT = {
  hero: {
    eyebrow: 'Real-time autonomous fraud intelligence',
    titlePrefix: 'Stop fraud before the',
    titleHighlight: 'transaction clears.',
    subheading:
      'SentinelX unites self-tuning machine learning with deterministic behavioral rules to evaluate transaction threats in under 5ms — protecting capital while preserving legitimate customer flow.',
    primaryCta: 'Launch Live Demo',
    primaryCtaUrl: '/app',
    secondaryCta: 'Explore Architecture',
    secondaryCtaUrl: '/technology',
  },
  pipeline: {
    badge: 'AI & ML Pipeline',
    title: 'How SentinelX Analyzes Transactions in Sub-5ms',
    subtitle: 'From sub-second raw telemetry ingestion to calibrated probability distribution and instant automated intervention.',
    steps: [
      {
        id: 'ingest',
        title: 'Data Ingestion',
        desc: 'Sub-millisecond ingestion over WebSocket or REST with strict payload verification and schema validation.',
      },
      {
        id: 'features',
        title: 'Feature Engineering',
        desc: 'Dynamic per-user rolling baselines, Haversine spherical speed, nocturnal flags, and velocity surge counters.',
      },
      {
        id: 'scoring',
        title: 'ML + Rules Scoring',
        desc: 'RandomForest ensemble cross-referenced with deterministic heuristic gates (70% ML + 30% rule blend).',
      },
      {
        id: 'alerting',
        title: 'Alerting & Dispatch',
        desc: 'Sub-second WebSocket broadcast to analyst command consoles with automated 5-minute deduping and escalation.',
      },
    ],
    features: [
      {
        title: 'Continuous Monitoring',
        desc: 'High-throughput stream processing evaluating micro-signals on every card swipe, tap, and wire transfer.',
      },
      {
        title: 'Behavioral Profiling',
        desc: 'Maintains rolling statistical baselines (mean, variance, frequent cities) without persistent cold-start penalty.',
      },
      {
        title: 'Impossible-Travel Physics',
        desc: 'Calculates spherical Haversine velocity between successive transactions, flagging speeds exceeding 900 km/h.',
      },
      {
        title: 'Closed-Loop Analyst Triage',
        desc: 'Every reviewed or dismissed alert feeds back into continuous retraining to minimize false alarm drift.',
      },
    ],
  },
  whySentinelX: {
    title: 'Why Enterprise Security Teams Choose SentinelX',
    subtitle: 'Engineered for zero-tolerance fintech environments where latency, accuracy, and auditability cannot be compromised.',
    pillars: [
      {
        title: 'Sub-5ms Execution',
        desc: 'In-memory statistical lookups and fast decision paths ensure zero friction during checkout.',
      },
      {
        title: 'Transparent Decisions',
        desc: 'Every flagged transaction breaks down the top contributing features and rule violations.',
      },
      {
        title: 'Calibrated Precision',
        desc: 'Resampling filters and 10-fold cross-validation eliminate classifier imbalance bias.',
      },
      {
        title: 'Full Audit Trail',
        desc: 'Immutable timeline of score decompositions and analyst sign-offs ready for SOC2 & PCI compliance.',
      },
    ],
  },
  caseStudy: {
    tag: 'Sample Scenario',
    title: 'Cross-Border Velocity Attack Neutralized',
    scenario:
      'In a simulated adversarial penetration test, an automated botnet initiated rapid micro-charges across three European capitals within 8 minutes for a single cardholder.',
    results: [
      'Impossible travel velocity (>3,200 km/h) flagged on the second transaction within 3.2ms.',
      'User baseline z-score deviation exceeded 4.2σ, shifting hybrid risk score to 0.94 (HIGH).',
      'Alert automatically consolidated in the 5-minute deduplication window, preventing triage storm.',
      'WebSocket notification dispatched to analyst desk with exact explainability factor breakdown.',
    ],
    ctaText: 'Inspect Benchmark Data',
    ctaUrl: '/technology',
  },
  techStack: {
    title: 'Built on Proven High-Performance Foundations',
    subtitle: 'Zero opaque proprietary black boxes. Enterprise-grade open source standards throughout.',
    technologies: [
      { name: 'Spring Boot 3', role: 'Reactive Core & REST API' },
      { name: 'Weka ML', role: 'Ensemble RandomForest' },
      { name: 'React 18', role: 'Cyber Command Console' },
      { name: 'Tailwind CSS', role: 'Zero-Runtime Design Tokens' },
      { name: 'Docker', role: 'Container Orchestration' },
      { name: 'WebSocket (STOMP)', role: 'Low-Latency Stream' },
    ],
  },
  footer: {
    legal: 'SentinelX Fraud Intelligence System. All algorithmic decisions and synthetic benchmarks are for defense testing.',
    newsletterTitle: 'Security Intelligence Dispatch',
    newsletterDesc: 'Monthly engineering notes on financial threat mitigation, model calibration, and velocity defense.',
  },
};

