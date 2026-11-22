/**
 * Alert — mensagem de feedback contextual
 *
 * variant: 'success' | 'warning' | 'danger' | 'info'
 *
 * ⚠️  Cores vêm de tailwind.config.js — não adicionar hex avulso aqui.
 */

const variants = {
  success: { wrap: 'bg-success/10 border-l-[3px] border-success', title: 'text-success',  body: 'text-tx-primary' },
  warning: { wrap: 'bg-warning/10 border-l-[3px] border-warning', title: 'text-warning',  body: 'text-tx-primary' },
  danger:  { wrap: 'bg-danger/10  border-l-[3px] border-danger',  title: 'text-danger',   body: 'text-tx-primary' },
  info:    { wrap: 'bg-info/10    border-l-[3px] border-info',    title: 'text-info',     body: 'text-tx-primary' },
}

export default function Alert({ variant = 'info', title, children, className = '' }) {
  const v = variants[variant]
  return (
    <div className={`rounded-md p-4 ${v.wrap} ${className}`}>
      {title    && <p className={`text-sm font-semibold mb-1 ${v.title}`}>{title}</p>}
      {children && <p className={`text-sm ${v.body}`}>{children}</p>}
    </div>
  )
}
