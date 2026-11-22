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
        base:      '#0a0a0a',   // fundo da página
        card:      '#111111',   // cards, tabelas
        'card-alt':'#1a1a1a',   // cards alternativos, histórico
        input:     '#161616',   // fundo de inputs e selects

        // ── Interação ────────────────────────────────────────────────
        hover:          '#252525',   // hover de linhas e itens
        active:         '#2e2e2e',   // item ativo na sidebar
        border:         '#2a2a2a',   // bordas padrão
        'border-strong':'#444444',   // bordas em hover/foco

        // ── Texto ────────────────────────────────────────────────────
        // ⚠️  Mude aqui para ajustar legibilidade em todo o sistema
        'tx-primary':  '#f5f5f5',   // títulos, texto principal
        'tx-secondary':'#dbdbdb',   // texto de suporte nos componentes
        'tx-dim':      '#a59a89',   // texto secundário (descrições, valores de tabela)
        'tx-muted':    '#797979',   // rodapés, dicas, desabilitados
        'tx-on-accent':'#ebebeb',   // texto SOBRE fundo amarelo (botão primário)

        // ── Marca ────────────────────────────────────────────────────
        // ⚠️  Mude aqui para trocar as cores das unidades
        evolution: {
          DEFAULT: '#eab308',
          hover:   '#ca8a04',
          muted:   '#eab30818',
          border:  '#eab30840',
        },
        power: {
          DEFAULT: '#dc2626',
          hover:   '#b91c1c',
          muted:   '#dc262618',
          border:  '#dc262640',
        },

        // ── Semânticas ───────────────────────────────────────────────
        // ⚠️  Mude aqui para ajustar as cores de status
        success: '#22c55e',
        warning: '#f59e0b',
        danger:  '#ef4444',
        info:    '#3b82f6',
      },
    },
  },
  plugins: [],
}
