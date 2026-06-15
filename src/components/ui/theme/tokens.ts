/**
 * Design tokens — map sang CSS custom properties trong `src/app/globals.css`.
 * Dùng cho dev tooling autocomplete và type-safe variant config.
 *
 * Tokens được resolve runtime qua CSS vars; thay đổi theme = override CSS var
 * trong `.dark` class hoặc media query.
 */
export const tokens = {
  color: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    border: 'var(--border)',
    gray: {
      100: 'var(--gray-100)',
      200: 'var(--gray-200)',
      400: 'var(--gray-400)',
      600: 'var(--gray-600)',
      800: 'var(--gray-800)',
    },
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    full: '9999px',
  },
  touchTarget: {
    /** Minimum tap target per WCAG 2.5.5 / Apple HIG / Material */
    min: '44px',
  },
} as const

export type Tokens = typeof tokens
