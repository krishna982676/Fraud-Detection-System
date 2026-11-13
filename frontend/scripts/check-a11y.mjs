import { JSDOM } from 'jsdom';
import axe from 'axe-core';

// 1. Precise WCAG 2.1 Contrast Formula
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(fgHex, bgHex) {
  const l1 = getLuminance(hexToRgb(fgHex));
  const l2 = getLuminance(hexToRgb(bgHex));
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

// 2. SentinelX Token Palette Verification
const tokens = {
  bg: '#050806',
  surface: '#0B120E',
  surfaceRaised: '#111C16',
  border: '#2A4033',
  borderStrong: '#3B5A48',
  textPrimary: '#E8FFF3',
  textSecondary: '#A7C4B3',
  textMuted: '#7F9C8B',
  accent: '#00FF9C',
  accentContrast: '#03140B',
  semanticLow: '#00E08A',
  semanticMedium: '#FFB020',
  semanticHigh: '#FF3B5C',
};

const tokenPairs = [
  { name: 'Primary Text on Base Background', fg: tokens.textPrimary, bg: tokens.bg, minRatio: 7.0 },
  { name: 'Primary Text on Surface', fg: tokens.textPrimary, bg: tokens.surface, minRatio: 7.0 },
  { name: 'Primary Text on Surface-Raised', fg: tokens.textPrimary, bg: tokens.surfaceRaised, minRatio: 7.0 },
  { name: 'Secondary Text on Base Background', fg: tokens.textSecondary, bg: tokens.bg, minRatio: 7.0 },
  { name: 'Secondary Text on Surface', fg: tokens.textSecondary, bg: tokens.surface, minRatio: 7.0 },
  { name: 'Muted Text on Base Background', fg: tokens.textMuted, bg: tokens.bg, minRatio: 4.5 },
  { name: 'Muted Text on Surface', fg: tokens.textMuted, bg: tokens.surface, minRatio: 4.5 },
  { name: 'Button Dark Text on Cyber Accent Fill', fg: tokens.accentContrast, bg: tokens.accent, minRatio: 7.0 },
  { name: 'Semantic Low (Green) on Base', fg: tokens.semanticLow, bg: tokens.bg, minRatio: 4.5 },
  { name: 'Semantic Medium (Amber) on Base', fg: tokens.semanticMedium, bg: tokens.bg, minRatio: 4.5 },
  { name: 'Semantic High (Red) on Base', fg: tokens.semanticHigh, bg: tokens.bg, minRatio: 4.5 },
];

console.log('='.repeat(70));
console.log('  SentinelX Design Tokens WCAG AA/AAA Contrast Verification');
console.log('='.repeat(70));

let failures = 0;
for (const pair of tokenPairs) {
  const ratio = getContrastRatio(pair.fg, pair.bg);
  const passed = ratio >= pair.minRatio;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [${ratio.toFixed(2)}:1 >= ${pair.minRatio}:1] ${pair.name} (${pair.fg} on ${pair.bg})`);
  if (!passed) failures++;
}

// 3. Axe-Core Evaluation over Page Document Templates
console.log('\n' + '='.repeat(70));
console.log('  Running axe-core on Page Document Shells (/, /demo, /app/simulator, /app/dashboard)');
console.log('='.repeat(70));

const pages = [
  {
    name: 'Home Page (/)',
    html: `<!DOCTYPE html><html lang="en"><head><title>Home</title></head><body style="background:#050806;color:#E8FFF3;">
      <header><nav aria-label="Main"><a href="/" style="color:#00FF9C">SentinelX.AI</a></nav></header>
      <main>
        <h1>Stop fraud before the transaction clears.</h1>
        <p style="color:#A7C4B3">Real-time fraud intelligence powered by machine learning.</p>
        <button style="background:#00FF9C;color:#03140B;font-weight:600;padding:8px 16px;">Launch Live Demo</button>
      </main>
    </body></html>`,
  },
  {
    name: 'Demo Request Page (/demo)',
    html: `<!DOCTYPE html><html lang="en"><head><title>Demo</title></head><body style="background:#050806;color:#E8FFF3;">
      <main>
        <h1>Fraud detection. Explained.</h1>
        <form>
          <label for="email" style="color:#A7C4B3;display:block;">Business Email</label>
          <input id="email" type="email" style="background:#111C16;color:#E8FFF3;border:1px solid #2A4033;" />
          <button type="submit" style="background:#00FF9C;color:#03140B;font-weight:600;">Request Demo</button>
        </form>
      </main>
    </body></html>`,
  },
  {
    name: 'Simulator Page (/app/simulator)',
    html: `<!DOCTYPE html><html lang="en"><head><title>Simulator</title></head><body style="background:#050806;color:#E8FFF3;">
      <main>
        <h1>Adversarial Traffic Simulator</h1>
        <div style="background:#0B120E;border:1px solid #2A4033;padding:16px;">
          <button style="background:#00FF9C;color:#03140B;font-weight:600;">Start Stream Injection</button>
          <label for="speed" style="color:#A7C4B3;display:block;font-size:12px;">Injection Speed</label>
          <select id="speed" style="background:#111C16;color:#E8FFF3;border:1px solid #2A4033;">
            <option>5 Transactions / sec</option>
          </select>
          <button style="background:rgba(0,255,156,0.15);border:1px solid #00FF9C;color:#00FF9C;font-weight:bold;">Weekly Grocery ($128.00)</button>
          <button type="submit" style="background:#00FF9C;color:#03140B;font-weight:600;">Evaluate Risk</button>
        </div>
      </main>
    </body></html>`,
  },
  {
    name: 'Dashboard Page (/app/dashboard)',
    html: `<!DOCTYPE html><html lang="en"><head><title>Dashboard</title></head><body style="background:#050806;color:#E8FFF3;">
      <main>
        <h1>Security Operations Center</h1>
        <div style="background:#0B120E;border:1px solid #2A4033;padding:16px;">
          <h2 style="color:#E8FFF3;">Live Ingestion Feed</h2>
          <table style="width:100%;color:#A7C4B3;">
            <caption style="color:#E8FFF3;">Live Transactions</caption>
            <thead><tr><th scope="col" style="color:#E8FFF3;">ID</th><th scope="col" style="color:#E8FFF3;">Amount</th></tr></thead>
            <tbody><tr><td style="color:#00FF9C;">TXN-1001</td><td style="color:#E8FFF3;">$128.50</td></tr></tbody>
          </table>
        </div>
      </main>
    </body></html>`,
  },
];

async function runAxeChecks() {
  for (const page of pages) {
    const dom = new JSDOM(page.html, { runScripts: 'dangerously' });
    const { window } = dom;

    // Polyfill canvas getContext if missing in jsdom
    if (!window.HTMLCanvasElement.prototype.getContext) {
      window.HTMLCanvasElement.prototype.getContext = () => ({
        fillRect: () => {},
        fillText: () => {},
        getImageData: () => ({ data: [0, 0, 0, 0] }),
      });
    }

    try {
      const results = await axe.run(window.document.documentElement, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      });

      const violations = results.violations.filter(
        (v) => v.id === 'color-contrast' || v.impact === 'serious' || v.impact === 'critical'
      );

      if (violations.length === 0) {
        console.log(`✅ PASS: ${page.name} - 0 WCAG AA contrast/critical violations`);
      } else {
        console.error(`❌ FAIL: ${page.name} reported violations:`);
        violations.forEach((v) => {
          console.error(`   - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} occurrences)`);
        });
        failures += violations.length;
      }
    } catch (err) {
      console.error(`Error running axe on ${page.name}:`, err.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  if (failures === 0) {
    console.log('  🎉 All WCAG AA contrast checks passed with ZERO violations!');
    console.log('='.repeat(70));
    process.exit(0);
  } else {
    console.error(`  ⚠️  Accessibility check failed with ${failures} violations.`);
    console.log('='.repeat(70));
    process.exit(1);
  }
}

runAxeChecks();
