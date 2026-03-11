import { defineEcConfig } from 'astro-expressive-code';

export default defineEcConfig({
  themes: 'gruvbox-light-hard',
  defaultProps: {
    wrap: true,
  },
  useThemedSelectionColors: true,
  styleOverrides: {
    borderColor: 'var(--border)',
    codeFontFamily: 'var(--mono)',
    codeFontSize: '1rem',
    codePaddingInline: '0.875rem',
    codePaddingBlock: '0.75rem',
  },
});
