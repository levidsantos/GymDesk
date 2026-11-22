/**
 * Button — componente de botão reutilizável
 *
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size:    'sm' | 'md' | 'lg'
 *
 * ⚠️  Cores vêm de tailwind.config.js — não adicionar hex avulso aqui.
 */

const variants = {
  // Fundo amarelo · texto escuro legível sobre o amarelo
  primary:
    'bg-evolution text-tx-on-accent font-semibold hover:bg-evolution-hover',

  // Contorno visível · texto claro
  secondary:
    'bg-transparent border border-border text-tx-primary hover:bg-hover hover:border-border-strong',

  // Discreto mas identificável como botão · borda sutil · texto de suporte
  ghost:
    'bg-transparent border border-border text-tx-secondary hover:text-tx-primary hover:bg-hover hover:border-border-strong',

  // Destrutivo
  danger:
    'bg-transparent border border-danger text-danger hover:bg-danger/10',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded',
  md: 'px-4 py-2   text-sm rounded-md',
  lg: 'px-5 py-2.5 text-sm rounded-md',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        transition-colors duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
