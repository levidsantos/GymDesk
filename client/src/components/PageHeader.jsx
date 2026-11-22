/**
 * PageHeader — breadcrumb + data no topo da área de conteúdo
 * ⚠️  Cores vêm de tailwind.config.js
 */
export default function PageHeader({ breadcrumb, date }) {
  return (
    <div className="flex items-center justify-between px-8 py-3 border-b border-border bg-base">
      <span className="text-xs text-tx-muted">{breadcrumb}</span>
      {date && <span className="text-xs text-tx-muted">{date}</span>}
    </div>
  )
}
