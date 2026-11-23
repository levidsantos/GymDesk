import { useState, useEffect } from 'react'
import StatCard from '../../components/StatCard'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'

async function apiFetch(path) {
  const res = await fetch(`/api${path}`, { credentials: 'include' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição.')
  return data
}

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function fmtPrice(v) {
  return (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtCompetence(comp) {
  if (!comp) return '—'
  const [y, m] = comp.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${months[parseInt(m) - 1]}/${y}`
}

function fmtMonthLabel(month) {
  if (!month) return '—'
  const [y, m] = month.split('-')
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  return `${months[parseInt(m) - 1]}/${y}`
}

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    apiFetch('/dashboard')
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-sm text-tx-muted py-8 text-center">Carregando...</p>
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  const { active_students, active_enrollments, month_payments, overdue, unit_stats, attention, reference_date } = data

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-tx-primary">Painel administrativo</h1>
        <p className="text-sm text-tx-dim mt-1">
          Visão geral dos alunos e das mensalidades das duas unidades.
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Alunos ativos"
          value={String(active_students)}
        />
        <StatCard
          label="Matrículas ativas"
          value={String(active_enrollments)}
        />
        <StatCard
          label={`Recebido em ${fmtMonthLabel(month_payments.month)}`}
          value={fmtPrice(month_payments.total)}
          sub={`${month_payments.count} pagamento${month_payments.count !== 1 ? 's' : ''} registrado${month_payments.count !== 1 ? 's' : ''}`}
        />
        <StatCard
          label="Mensalidades em atraso"
          value={String(overdue.count)}
          sub={overdue.count > 0 ? `Total pendente: ${fmtPrice(overdue.total)}` : 'Nenhuma mensalidade vencida'}
        />
      </div>

      {/* Mensalidades pendentes */}
      <div className="bg-card border border-border rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-tx-primary">
            Mensalidades que precisam de atenção
          </h2>
        </div>

        {attention.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-tx-muted">Nenhuma mensalidade pendente no momento.</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Aluno</Th>
                <Th>Unidade</Th>
                <Th>Competência</Th>
                <Th>Vencimento</Th>
                <Th>Valor</Th>
                <Th>Situação</Th>
              </Tr>
            </Thead>
            <Tbody>
              {attention.map(row => (
                <Tr key={row.id}>
                  <Td>{row.student_name}</Td>
                  <Td>
                    <span className={`text-xs font-medium ${
                      row.unit_slug === 'evolution' ? 'text-evolution' : 'text-power'
                    }`}>
                      {row.unit_name}
                    </span>
                  </Td>
                  <Td className="text-tx-dim">{fmtCompetence(row.competence)}</Td>
                  <Td className="text-tx-dim">{fmtDate(row.due_date)}</Td>
                  <Td>{fmtPrice(row.amount)}</Td>
                  <Td>
                    <Badge variant={row.is_overdue ? 'danger' : 'warning'}>
                      {row.is_overdue ? 'Em atraso' : 'Em aberto'}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        <div className="px-6 py-3 border-t border-border">
          <span className="text-xs text-tx-muted">
            {attention.length} mensalidade{attention.length !== 1 ? 's' : ''} · referência: {fmtDate(reference_date)}
          </span>
        </div>
      </div>

      {/* Alunos por unidade + Regras */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-tx-primary mb-4">Matrículas por unidade</h2>
          <div className="space-y-3">
            {unit_stats.length === 0 ? (
              <p className="text-sm text-tx-muted">Nenhuma matrícula registrada.</p>
            ) : unit_stats.map(u => (
              <div key={u.slug} className="flex items-center justify-between">
                <span className={`text-sm font-medium ${u.slug === 'evolution' ? 'text-evolution' : 'text-power'}`}>
                  {u.name}
                </span>
                <span className="text-sm text-tx-primary font-semibold">
                  {u.active} ativa{u.active !== 1 ? 's' : ''}
                  {u.inactive > 0 && ` · ${u.inactive} inativa${u.inactive !== 1 ? 's' : ''}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-tx-primary mb-3">
            Regras de acesso em vigor
          </h2>
          <p className="text-sm text-tx-dim leading-relaxed">
            Alunos da Muscle Power: acesso à própria unidade e à Muscle Evolution somente aos
            domingos. Alunos da Muscle Evolution: acesso às duas unidades.
          </p>
          <p className="text-xs text-tx-muted mt-3">
            Exige matrícula ativa e nenhuma mensalidade vencida.
          </p>
        </div>
      </div>
    </div>
  )
}
