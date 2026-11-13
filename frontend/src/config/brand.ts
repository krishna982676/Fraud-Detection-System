export interface BrandConfig {
  name: string;
  tagline: string;
  subheading: string;
  version: string;
  statusUrl: string;
  repoUrl: string;
  contactEmail: string;
  copyrightYear: number;
}

export const BRAND: BrandConfig = {
  name: 'SentinelX',
  tagline: 'Real-time autonomous fraud intelligence',
  subheading: 'Stop fraud before the transaction clears with sub-5ms hybrid machine learning scoring and dynamic behavioral profiling.',
  version: 'v1.4.2',
  statusUrl: '/actuator/health',
  repoUrl: 'https://github.com/sentinelx/sentinelx-engine',
  contactEmail: 'security@sentinelx.io',
  copyrightYear: 2026,
};

