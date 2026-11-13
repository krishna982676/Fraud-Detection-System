# SentinelX Design System & Component Library

## 1. Palette & Surface Architecture

| Token | Value | Role | Contrast vs Text |
|---|---|---|---|
| `--bg-base` | `#050806` | Root document canvas | High (16.2:1) |
| `--bg-surface` | `#0A100C` | Primary component card base | High (14.8:1) |
| `--bg-surface-raised` | `#0F1A13` | Elevated drawers, toolbars, pills | High (12.4:1) |
| `--bg-surface-elevated` | `#14221A` | Dropdowns, hover states, modals | High (10.9:1) |
| `--border-default` | `#1A2B20` | Subtle hairline dividers (1px) | AA Compliant |
| `--border-glow` | `rgba(0, 255, 156, 0.25)` | Active selection or alert glow | - |

## 2. Cyber Accent Accents

- **Primary Neon Cyber Green**: `#00FF9C`
- **Soft Green Variant**: `#00E08A`
- **Dim Green Fill**: `#0B3D2A`
- **Secondary Electric Teal**: `#00E5FF`
- **Electric Teal Dim**: `#083B44`

## 3. Semantic Severity Tokens

- **LOW Risk**: `#00FF9C` (Neon Cyber Green)
- **MEDIUM Risk**: `#FFB020` (Deep Amber Warning)
- **HIGH Risk / CRITICAL**: `#FF3B5C` (Cyber Crimson Red)

> [!IMPORTANT]
> Green is strictly reserved for "Nominal / Cleared / LOW risk". It is never used to convey an active hazard.

## 4. Typography Hierarchy

- **UI Sans**: `"Space Grotesk"`, `Inter`, `sans-serif`
- **Data & Monospace**: `"JetBrains Mono"`, `monospace`
- **Numbers**: Always rendered with `tabular-nums` (`font-variant-numeric: tabular-nums`) to prevent jitter in live stream updates.

## 5. Subtle Effects & Motion

- **Matrix Grid**: Pure CSS gradients (`linear-gradient`) without external image asset dependencies.
- **Hero Scanline**: CRT-style hairline scanlines on the marketing hero with 40% alpha.
- **Glowing Borders**: 1px gradient mask transitions from `#00FF9C` to `#00E5FF`.
- **Reduced Motion Safety**: Automatically collapses animations under `@media (prefers-reduced-motion: reduce)`.

