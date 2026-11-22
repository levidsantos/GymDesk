/**
 * AdminLayout — wrapper da área administrativa
 * Sidebar fixa à esquerda + área de conteúdo scrollável
 */
import AdminSidebar from './AdminSidebar'
import PageHeader from './PageHeader'

export default function AdminLayout({ currentPage, onNavigate, breadcrumb, date, children }) {
  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader breadcrumb={breadcrumb} date={date} />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {children}
        </main>
      </div>
    </div>
  )
}
