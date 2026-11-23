import { useState, useEffect } from 'react'
import { apiFetch } from './lib/api'

import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'

import AdminLayout  from './components/AdminLayout'
import Dashboard    from './pages/admin/Dashboard'
import Students     from './pages/admin/Students'
import Payments     from './pages/admin/Payments'
import Rules        from './pages/admin/Rules'

import StudentLayout  from './components/StudentLayout'
import StudentHome    from './pages/student/Home'
import StudentFinance from './pages/student/Finance'
import StudentRules   from './pages/student/Rules'

const adminPages = {
  dashboard: { component: Dashboard, breadcrumb: 'Gestão das duas unidades / Painel administrativo' },
  students:  { component: Students,  breadcrumb: 'Gestão das duas unidades / Alunos e matrículas'  },
  payments:  { component: Payments,  breadcrumb: 'Gestão das duas unidades / Mensalidades'         },
  rules:     { component: Rules,     breadcrumb: 'Gestão das duas unidades / Regras de acesso'     },
}

const studentPages = {
  home:    { component: StudentHome,    breadcrumb: 'Portal do aluno / Página inicial'       },
  finance: { component: StudentFinance, breadcrumb: 'Portal do aluno / Situação financeira'  },
  rules:   { component: StudentRules,   breadcrumb: 'Portal do aluno / Regras de acesso'     },
}

function todayBR() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default function App() {
  const [account, setAccount]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [adminPage, setAdminPage]   = useState('dashboard')
  const [studentPage, setStudentPage] = useState('home')

  useEffect(() => {
    apiFetch('/auth/me')
      .then(data => setAccount(data.account))
      .catch(() => setAccount(null))
      .finally(() => setLoading(false))
  }, [])

  function handleLogin(acc) {
    setAccount(acc)
  }

  async function handleLogout() {
    try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
    setAccount(null)
    setAdminPage('dashboard')
    setStudentPage('home')
  }

  function handlePasswordChanged() {
    setAccount(prev => ({ ...prev, must_change_password: false }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <p className="text-tx-muted text-sm">Carregando...</p>
      </div>
    )
  }

  if (!account) {
    return <Login onLogin={handleLogin} />
  }

  if (account.must_change_password) {
    return <ChangePassword onSuccess={handlePasswordChanged} onLogout={handleLogout} />
  }

  if (account.role === 'admin') {
    const { component: Page, breadcrumb } = adminPages[adminPage]
    return (
      <AdminLayout
        currentPage={adminPage}
        onNavigate={setAdminPage}
        breadcrumb={breadcrumb}
        date={todayBR()}
        accountName={account.email}
        onLogout={handleLogout}
      >
        <Page />
      </AdminLayout>
    )
  }

  const { component: Page, breadcrumb } = studentPages[studentPage]
  const unitColor = account.unit_slug === 'power'
    ? 'rgb(var(--color-power))'
    : 'rgb(var(--color-evolution))'
  return (
    <StudentLayout
      currentPage={studentPage}
      onNavigate={setStudentPage}
      breadcrumb={breadcrumb}
      date={todayBR()}
      studentName={account.student_name || 'Aluno'}
      enrollment={account.unit_name && account.plan_name ? `${account.unit_name} · ${account.plan_name}` : ''}
      accentColor={unitColor}
      onLogout={handleLogout}
    >
      <Page onNavigate={setStudentPage} />
    </StudentLayout>
  )
}
