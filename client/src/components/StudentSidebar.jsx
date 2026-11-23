/**
 * StudentSidebar — navegação lateral da área do aluno
 *
 * accentColor: 'evolution' | 'power'  (padrão: 'evolution')
 * Aceita a string do token Tailwind, não hex avulso.
 *
 * ⚠️  Bordas e ícone do logo usam style inline porque o valor do token
 *     varia dinamicamente por unidade do aluno (Power = vermelho, Evolution = amarelo).
 *     O resto usa tokens de tailwind.config.js.
 */
import { Home, Wallet, ShieldCheck, LogOut, Dumbbell } from 'lucide-react'

const navItems = [
  { label: 'Página inicial',      icon: Home,        page: 'home'    },
  { label: 'Situação financeira', icon: Wallet,       page: 'finance' },
  { label: 'Regras de acesso',    icon: ShieldCheck,  page: 'rules'   },
]

// accentColor recebe o valor hex vindo do App.jsx (ex: '#dc2626' ou '#eab308')
export default function StudentSidebar({
  currentPage,
  onNavigate,
  studentName,
  enrollment,
  accentColor = '#eab308',
  onLogout,
}) {
  return (
    <aside className="
      w-[220px] min-w-[220px] h-screen sticky top-0
      bg-card border-r border-border
      flex flex-col overflow-y-auto
    ">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-2 mb-0.5">
          <Dumbbell size={18} style={{ color: accentColor }} />
          <span className="font-bold text-base text-tx-primary tracking-tight">GymDesk</span>
        </div>
        <span className="text-[11px] text-tx-muted">Área do aluno</span>
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
                <span
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
                  style={{ background: accentColor }}
                />
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

      {/* Aluno + Sair */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-sm text-tx-primary font-medium">{studentName || 'Aluno'}</p>
        <p className="text-xs text-tx-muted mb-3">{enrollment || ''}</p>
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
}
