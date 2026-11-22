/**
 * Card — container de conteúdo com borda e fundo escuro
 * ⚠️  Cores vêm de tailwind.config.js
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-card border border-border rounded-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
