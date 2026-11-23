/**
 * AdminSidebar — navegação lateral da área administrativa
 *
 * Desktop: renderizado diretamente como aside fixa.
 * Mobile (mobile=true): renderizado como drawer overlay com backdrop.
 *
 * ⚠️  Cores vêm de tailwind.config.js — não adicionar hex avulso aqui.
 */
import { useEffect } from 'react'
import { LayoutDashboard, Users, CreditCard, ShieldCheck, LogOut, Dumbbell, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { label: 'Painel administrativo', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Alunos e matrículas',   icon: Users,           page: 'students'  },
  { label: 'Mensalidades',          icon: CreditCard,      page: 'payments'  },
  { label: 'Regras de acesso',      icon: ShieldCheck,     page: 'rules'     },
]

export default function AdminSidebar({
  currentPage,
  onNavigate,
  accountName,
  onLogout,
  mobile = false,
  open = false,
  onClose,
}) {
  useEffect(() => {
    if (!mobile || !open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobile, open, onClose])

  if (mobile && !open) return null

  const sidebar = (
    <aside className={`
      w-[220px] min-w-[220px] h-screen
      bg-card border-r border-border
      flex flex-col overflow-y-auto
      ${mobile ? '' : 'sticky top-0'}
    `}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Dumbbell size={18} className="text-evolution" />
            <span className="font-bold text-base text-tx-primary tracking-tight">GymDesk</span>
          </div>
          <span className="text-[11px] text-tx-muted">Área administrativa</span>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            className="p-1 text-tx-muted hover:text-tx-primary transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.page
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`
                w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left
                transition-colors duration-100 relative
                ${isActive
                  ? 'bg-active text-tx-primary font-medium'
                  : 'text-tx-secondary hover:bg-hover hover:text-tx-primary'
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-evolution rounded-r" />
              )}
              <Icon size={15} />
              {item.label}
            </button>
          )
        })}

        <div className="mx-5 my-3 border-t border-border" />

        <p className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-tx-muted">
          Unidades
        </p>
        {['Muscle Power', 'Muscle Evolution'].map((unit) => (
          <div key={unit} className="px-5 py-1.5">
            <span className="text-sm text-tx-secondary">{unit}</span>
          </div>
        ))}

      </nav>

      {/* Tema */}
      <div className="px-5 py-3 flex items-center justify-between">
        <span className="text-[11px] text-tx-muted">Tema</span>
        <ThemeToggle />
      </div>

      {/* Usuário + Sair */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-sm text-tx-primary font-medium">{accountName || 'Administrador'}</p>
        <p className="text-xs text-tx-muted mb-3">Admin</p>
        <button
          onClick={onLogout}
          className="
            w-full flex items-center gap-2 text-sm text-tx-secondary
            hover:text-danger transition-colors duration-150
          "
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  )

  if (!mobile) return sidebar

  return (
    <div
      className="fixed inset-0 z-50 flex md:hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative z-10">
        {sidebar}
      </div>
    </div>
  )
}
