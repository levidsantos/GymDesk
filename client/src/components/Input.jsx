/**
 * Input     — campo de texto
 * Select    — seletor com seta chevron visível
 * InputField — label + campo + erro/hint empacotados
 *
 * ⚠️  Cores vêm de tailwind.config.js — não adicionar hex avulso aqui.
 */
import { ChevronDown } from 'lucide-react'

export function Input({ className = '', error = false, ...props }) {
  return (
    <input
      className={`
        w-full bg-input border rounded-md px-3 py-2 text-sm
        text-tx-primary placeholder-tx-muted
        outline-none transition-colors duration-150
        ${error
          ? 'border-danger   focus:border-danger'
          : 'border-border   focus:border-evolution'
        }
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  )
}

export function Select({ children, className = '', error = false, ...props }) {
  return (
    <div className="relative w-full">
      <select
        className={`
          w-full bg-input border rounded-md px-3 py-2 pr-8 text-sm
          text-tx-primary outline-none transition-colors duration-150
          cursor-pointer appearance-none
          ${error
            ? 'border-danger   focus:border-danger'
            : 'border-border   focus:border-evolution'
          }
          disabled:opacity-40 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tx-muted pointer-events-none"
      />
    </div>
  )
}

export function InputField({ label, error, hint, className = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-tx-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      {children ? children : <Input error={!!error} {...props} />}
      {error && <span className="text-xs text-danger">{error}</span>}
      {hint && !error && <span className="text-xs text-tx-muted">{hint}</span>}
    </div>
  )
}
