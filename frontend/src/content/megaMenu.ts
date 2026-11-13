export interface MegaMenuItem {
  title: string;
  desc: string;
  iconName: string;
  href: string;
}

export interface MegaMenuSection {
  id: string;
  label: string;
  introTitle?: string;
  introDesc?: string;
  items: MegaMenuItem[];
}

export const MEGA_MENU_DATA: MegaMenuSection[] = [
  {
    id: 'solutions',
    label: 'Solutions',
    introTitle: 'Threat Vector Defense',
    introDesc: 'Multi-layer transaction security engineered for real-time payment rails.',
    items: [
      {
        title: 'Real-Time Transaction Scoring',
        desc: 'Sub-5ms hybrid inference on debit, credit, and RTP rails.',
        iconName: 'Zap',
        href: '/app/dashboard',
      },
      {
        title: 'Account Takeover Protection',
        desc: 'Detect credential stuffing and suspicious behavioral pattern shifts.',
        iconName: 'ShieldAlert',
        href: '/technology',
      },
      {
        title: 'Impossible Travel Radar',
        desc: 'Geodesic velocity checks flagging physically impossible transits.',
        iconName: 'Globe',
        href: '/technology',
      },
      {
        title: 'Velocity Burst Defense',
        desc: 'Detect high-frequency card testing and automated micro-charge attacks.',
        iconName: 'Activity',
        href: '/app/simulator',
      },
    ],
  },
  {
    id: 'technology',
    label: 'Technology',
    introTitle: 'Transparent Architecture',
    introDesc: 'No black-box obscurity. Calibrated Random Forests + Deterministic Heuristics.',
    items: [
      {
        title: 'Random Forest Ensemble',
        desc: '50-tree balanced classifier trained on multi-modal distributions.',
        iconName: 'Cpu',
        href: '/technology',
      },
      {
        title: 'Threshold Sweeper',
        desc: 'Interactive trade-off curves for precision vs. recall calibration.',
        iconName: 'Sliders',
        href: '/app/model',
      },
      {
        title: 'Dynamic Baselines',
        desc: 'Rolling Gaussian profiles per user for personalized anomaly detection.',
        iconName: 'UserCheck',
        href: '/technology',
      },
      {
        title: 'Model Benchmarking',
        desc: '10-fold cross-validation metrics across RF, J48, and Logistic baselines.',
        iconName: 'BarChart2',
        href: '/technology',
      },
    ],
  },
  {
    id: 'industries',
    label: 'Industries',
    introTitle: 'Built for High-Stakes Rails',
    introDesc: 'Protecting transaction volumes across global enterprise verticals.',
    items: [
      {
        title: 'Payment Processors',
        desc: 'Zero-latency pre-authorization screening for acquirers and gateways.',
        iconName: 'CreditCard',
        href: '/demo',
      },
      {
        title: 'Digital Banking & Neobanks',
        desc: 'Safeguard customer deposits with continuous behavioral baseline tracking.',
        iconName: 'Landmark',
        href: '/demo',
      },
      {
        title: 'Fintech & Wallets',
        desc: 'Stop wallet draining, rogue P2P transfers, and rapid micro-deposits.',
        iconName: 'Wallet',
        href: '/demo',
      },
      {
        title: 'Global E-Commerce',
        desc: 'Minimize chargeback fees while preserving smooth checkout conversion.',
        iconName: 'ShoppingCart',
        href: '/demo',
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    introTitle: 'Security Documentation',
    introDesc: 'Developer documentation, API schemas, and mathematical proofs.',
    items: [
      {
        title: 'REST API & WebSocket Specs',
        desc: 'OpenAPI endpoints and STOMP topic subscription documentation.',
        iconName: 'Code',
        href: '/technology',
      },
      {
        title: 'Interactive Model Lab',
        desc: 'Evaluate model confusion matrices and feature importance rankings.',
        iconName: 'Terminal',
        href: '/app/model',
      },
      {
        title: 'Adversarial Simulator',
        desc: 'Inject synthetic transaction bursts with tunable fraud probabilities.',
        iconName: 'PlayCircle',
        href: '/app/simulator',
      },
      {
        title: 'Frequently Asked Questions',
        desc: 'Detailed answers on model training, class imbalance, and data ethics.',
        iconName: 'HelpCircle',
        href: '/#faq',
      },
    ],
  },
];

