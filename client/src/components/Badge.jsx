/**
 * Badge — rótulo de status inline
 *
 * variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 *          | 'evolution' | 'power'
 *
 * ⚠️  Cores semânticas vêm de tailwind.config.js.
 *     As variantes de marca usam os tokens evolution/power do config.
 *     Cores com opacidade (/10, /20) são geradas pelo Tailwind automaticamente.
 */

const variants = {
  success:   'bg-success/10   text-success   border-success/20',
  warning:   'bg-warning/10   text-warning   border-warning/20',
  danger:    'bg-danger/10    text-danger    border-danger/20',
  info:      'bg-info/10      text-info      border-info/20',
  neutral:   'bg-active       text-tx-secondary border-border',
  evolution: 'bg-evolution-muted text-evolution border-evolution-border',
  power:     'bg-power-muted     text-power     border-power-border',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
