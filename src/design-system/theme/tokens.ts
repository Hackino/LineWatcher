/**
 * Control-room dark design tokens.
 *
 * Single source of truth for color, spacing, radius, and typography.
 * Components must reference these — no hardcoded values.
 */

export const colors = {
  // Surfaces (deep slate, layered)
  bg: '#0B0F14',
  panel: '#121821',
  raised: '#1A2230',
  hairline: '#233043',
  overlay: 'rgba(4, 8, 13, 0.72)',

  // Text
  text: '#E6EDF3',
  textMuted: '#8B97A7',
  textFaint: '#5A6675',

  // Semantic
  safe: '#34D399',
  safeDim: 'rgba(52, 211, 153, 0.14)',
  leak: '#F87171',
  leakDim: 'rgba(248, 113, 113, 0.14)',
  warn: '#FBBF24',
  warnDim: 'rgba(251, 191, 36, 0.14)',

  // Accent (electric)
  accent: '#38BDF8',
  accentDim: 'rgba(56, 189, 248, 0.14)',

  // Meter identity
  provider: '#38BDF8', // electric blue — the billing line
  house: '#A78BFA', // violet — your household

  // Utility
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

export const typography = {
  // Big tabular numerals for meter readouts / kWh figures
  mono: 'monospace',
  display: { size: 44, weight: '800' as const, letter: -1 },
  h1: { size: 28, weight: '800' as const, letter: -0.5 },
  h2: { size: 20, weight: '700' as const, letter: -0.2 },
  title: { size: 16, weight: '700' as const, letter: 0 },
  body: { size: 15, weight: '500' as const, letter: 0 },
  label: { size: 13, weight: '600' as const, letter: 0.2 },
  caption: { size: 11, weight: '700' as const, letter: 1.4 }, // uppercase eyebrows
} as const;

export const shadow = {
  // Neon glow presets (color passed by caller for semantic glows)
  glow: (color: string, radius = 18) => ({
    shadowColor: color,
    shadowOpacity: 0.6,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  }),
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export type ThemeColor = keyof typeof colors;
