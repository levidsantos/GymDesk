/**
 * AdminLayout — wrapper da área administrativa
 * Desktop: sidebar fixa à esquerda + conteúdo scrollável
 * Mobile (<md): header com hamburger + drawer lateral
 */
import { useState } from 'react'
import { Menu, Dumbbell } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import PageHeader from './PageHeader'

export default function AdminLayout({ currentPage, onNavigate, breadcrumb, date, accountName, onLogout, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleNavigate(page) {
    setDrawerOpen(false)
    onNavigate(page)
  }

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <AdminSidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          accountName={accountName}
          onLogout={onLogout}
        />
      </div>

      {/* Drawer mobile */}
      <AdminSidebar
        mobile
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        accountName={accountName}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-evolution" />
            <span className="font-bold text-sm text-tx-primary tracking-tight">GymDesk</span>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -mr-2 text-tx-secondary hover:text-tx-primary transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
        {breadcrumb && (
          <div className="flex md:hidden px-4 py-2 border-b border-border bg-base">
            <span className="text-xs text-tx-muted truncate">{breadcrumb.split(' / ').pop()}</span>
          </div>
        )}

        <PageHeader breadcrumb={breadcrumb} date={date} className="hidden md:flex" />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7">
          {children}
        </main>
      </div>
    </div>
  )
}
