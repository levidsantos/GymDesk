/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // ── Superfícies ──────────────────────────────────────────────
        base:      'rgb(var(--color-base) / <alpha-value>)',
        card:      'rgb(var(--color-card) / <alpha-value>)',
        'card-alt':'rgb(var(--color-card-alt) / <alpha-value>)',
        input:     'rgb(var(--color-input) / <alpha-value>)',

        // ── Interação ────────────────────────────────────────────────
        hover:          'rgb(var(--color-hover) / <alpha-value>)',
        active:         'rgb(var(--color-active) / <alpha-value>)',
        border:         'rgb(var(--color-border) / <alpha-value>)',
        'border-strong':'rgb(var(--color-border-strong) / <alpha-value>)',

        // ── Texto ────────────────────────────────────────────────────
        'tx-primary':  'rgb(var(--color-tx-primary) / <alpha-value>)',
        'tx-secondary':'rgb(var(--color-tx-secondary) / <alpha-value>)',
        'tx-dim':      'rgb(var(--color-tx-dim) / <alpha-value>)',
        'tx-muted':    'rgb(var(--color-tx-muted) / <alpha-value>)',
        'tx-on-accent':'rgb(var(--color-tx-on-accent) / <alpha-value>)',

        // ── Marca ────────────────────────────────────────────────────
        evolution: {
          DEFAULT: 'rgb(var(--color-evolution) / <alpha-value>)',
          hover:   'rgb(var(--color-evolution-hover) / <alpha-value>)',
          muted:   'var(--color-evolution-muted)',
          border:  'var(--color-evolution-border)',
        },
        power: {
          DEFAULT: 'rgb(var(--color-power) / <alpha-value>)',
          hover:   'rgb(var(--color-power-hover) / <alpha-value>)',
          muted:   'var(--color-power-muted)',
          border:  'var(--color-power-border)',
        },

        // ── Semânticas ───────────────────────────────────────────────
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger:  'rgb(var(--color-danger) / <alpha-value>)',
        info:    'rgb(var(--color-info) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
