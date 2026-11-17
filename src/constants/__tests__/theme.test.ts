import { Colors, type ThemeColor } from '@/constants/theme';

/** WCAG relative luminance, https://www.w3.org/TR/WCAG21/#dfn-relative-luminance */
function relativeLuminance(hex: string): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((part) => channel(parseInt(part, 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio */
function contrastRatio(hexA: string, hexB: string): number {
  const [lighter, darker] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const TEXT_PAIRS: [ThemeColor, ThemeColor][] = [
  ['text', 'background'],
  ['text', 'surface'],
  ['textSecondary', 'background'],
  ['textSecondary', 'surface'],
  ['onPrimary', 'primary'],
  ['primary', 'background'],
  ['error', 'background'],
];

describe.each(['light', 'dark'] as const)('%s theme contrast (design doc 5.1)', (mode) => {
  const theme = Colors[mode];

  it.each(TEXT_PAIRS)('%s on %s is at least 4.5:1 (WCAG AA text)', (foreground, background) => {
    expect(contrastRatio(theme[foreground], theme[background])).toBeGreaterThanOrEqual(4.5);
  });

  it('border on background is at least 3:1 (WCAG AA non-text)', () => {
    expect(contrastRatio(theme.border, theme.background)).toBeGreaterThanOrEqual(3);
  });
});
