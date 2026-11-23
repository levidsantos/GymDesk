/**
 * PageHeader — breadcrumb + data no topo da área de conteúdo
 * ⚠️  Cores vêm de tailwind.config.js
 */
export default function PageHeader({ breadcrumb, date, className = '' }) {
  return (
    <div className={`flex items-center justify-between px-4 md:px-8 py-3 border-b border-border bg-base ${className}`}>
      <span className="text-xs text-tx-muted truncate">{breadcrumb}</span>
      {date && <span className="text-xs text-tx-muted whitespace-nowrap ml-4 hidden sm:inline">{date}</span>}
    </div>
  )
}
