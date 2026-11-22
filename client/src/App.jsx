import { useState } from 'react'

import Login from './pages/Login'

import AdminLayout  from './components/AdminLayout'
import Dashboard    from './pages/admin/Dashboard'
import Students     from './pages/admin/Students'
import Payments     from './pages/admin/Payments'
import Rules        from './pages/admin/Rules'

import StudentLayout  from './components/StudentLayout'
import StudentHome    from './pages/student/Home'
import StudentFinance from './pages/student/Finance'
import StudentRules   from './pages/student/Rules'

// Página e breadcrumb por rota — admin
const adminPages = {
  dashboard: {
    component: Dashboard,
    breadcrumb: 'Gestão das duas unidades / Painel administrativo',
  },
  students: {
    component: Students,
    breadcrumb: 'Gestão das duas unidades / Alunos e matrículas',
  },
  payments: {
    component: Payments,
    breadcrumb: 'Gestão das duas unidades / Mensalidades',
  },
  rules: {
    component: Rules,
    breadcrumb: 'Gestão das duas unidades / Regras de acesso',
  },
}

// Página e breadcrumb por rota — aluno
const studentPages = {
  home: {
    component: StudentHome,
    breadcrumb: 'Portal do aluno / Página inicial',
  },
  finance: {
    component: StudentFinance,
    breadcrumb: 'Portal do aluno / Situação financeira',
  },
  rules: {
    component: StudentRules,
    breadcrumb: 'Portal do aluno / Regras de acesso',
  },
}

function todayBR() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default function App() {
  const [role, setRole]         = useState(null)   // null | 'admin' | 'student'
  const [adminPage, setAdminPage]   = useState('dashboard')
  const [studentPage, setStudentPage] = useState('home')

  // — Login —
  if (!role) {
    return <Login onLogin={(r) => setRole(r)} />
  }

  // — Área administrativa —
  if (role === 'admin') {
    const { component: Page, breadcrumb } = adminPages[adminPage]
    return (
      <AdminLayout
        currentPage={adminPage}
        onNavigate={setAdminPage}
        breadcrumb={breadcrumb}
        date={todayBR()}
      >
        <Page />
      </AdminLayout>
    )
  }

  // — Área do aluno —
  const { component: Page, breadcrumb } = studentPages[studentPage]
  return (
    <StudentLayout
      currentPage={studentPage}
      onNavigate={setStudentPage}
      breadcrumb={breadcrumb}
      date={todayBR()}
      studentName="Lucas Ferreira"
      enrollment="Matrícula GD-0043"
      accentColor="#dc2626"   // Power = vermelho
    >
      <Page onNavigate={setStudentPage} />
    </StudentLayout>
  )
}
