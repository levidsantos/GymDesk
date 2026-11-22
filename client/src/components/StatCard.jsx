/**
 * StatCard — card de indicador numérico para o dashboard
 * ⚠️  Cores vêm de tailwind.config.js
 */
export default function StatCard({ label, value, sub, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-5 ${className}`}>
      <p className="text-xs text-tx-secondary font-medium uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-tx-primary leading-none mb-2">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-tx-muted">{sub}</p>
      )}
    </div>
  )
}
