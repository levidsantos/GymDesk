import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import Badge from '../../components/Badge'
import StatCard from '../../components/StatCard'
import Alert from '../../components/Alert'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function fmtPrice(v) {
  return v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '—'
}

function fmtCompetence(comp) {
  if (!comp) return '—'
  const [y, m] = comp.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${months[parseInt(m) - 1]}/${y}`
}

function installmentBadge(inst) {
  if (inst.status === 'paid') return { variant: 'success', label: 'Pago' }
  if (inst.status === 'cancelled') return { variant: 'neutral', label: 'Cancelada' }
  if (inst.is_overdue) return { variant: 'danger', label: 'Em atraso' }
  return { variant: 'warning', label: 'Em aberto' }
}

export default function StudentFinance() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    apiFetch('/portal/finance')
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

  const { student, installments, payments } = data

  if (!student) {
    return <Alert variant="warning">Conta não vinculada a um cadastro de aluno.</Alert>
  }

  const today = new Date().toISOString().slice(0, 10)
  const pending = installments.filter(i => i.status === 'pending' && !i.is_overdue)
  const overdue = installments.filter(i => i.is_overdue)
  const pendingTotal = pending.reduce((s, i) => s + i.amount, 0)
  const overdueTotal = overdue.reduce((s, i) => s + i.amount, 0)
  const nextPending  = pending.length > 0
    ? pending.reduce((a, b) => a.due_date < b.due_date ? a : b)
    : null

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-tx-primary">Situação financeira</h1>
        <p className="text-sm text-tx-dim mt-1">{student.name}</p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7 mt-6">
        <StatCard
          label="Em aberto"
          value={fmtPrice(pendingTotal)}
          sub={pending.length === 0
            ? 'Nenhuma mensalidade pendente'
            : `${pending.length} mensalidade${pending.length > 1 ? 's' : ''}`
          }
        />
        <StatCard
          label="Próximo vencimento"
          value={nextPending ? fmtDate(nextPending.due_date) : '—'}
          sub={nextPending ? `${fmtCompetence(nextPending.competence)} · ${fmtPrice(nextPending.amount)}` : 'Sem pendências'}
        />
        <StatCard
          label="Em atraso"
          value={fmtPrice(overdueTotal)}
          sub={overdue.length === 0
            ? 'Nenhuma mensalidade vencida'
            : `${overdue.length} mensalidade${overdue.length > 1 ? 's' : ''} vencida${overdue.length > 1 ? 's' : ''}`
          }
        />
      </div>

      {/* Tabela de mensalidades */}
      <div className="bg-card border border-border rounded-lg mb-5">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-tx-primary">Minhas mensalidades</h2>
        </div>

        {installments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-tx-muted">Nenhuma mensalidade encontrada.</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Competência</Th>
                <Th>Vencimento</Th>
                <Th>Valor</Th>
                <Th>Situação</Th>
              </Tr>
            </Thead>
            <Tbody>
              {installments.map(inst => {
                const badge = installmentBadge(inst)
                return (
                  <Tr key={inst.id}>
                    <Td>{fmtCompetence(inst.competence)}</Td>
                    <Td className="text-tx-dim">{fmtDate(inst.due_date)}</Td>
                    <Td>{fmtPrice(inst.amount)}</Td>
                    <Td><Badge variant={badge.variant}>{badge.label}</Badge></Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        )}

        <div className="px-6 py-3 border-t border-border">
          <p className="text-xs text-tx-muted">
            {installments.length} mensalidade{installments.length !== 1 ? 's' : ''} encontrada{installments.length !== 1 ? 's' : ''}.
            {' '}Uma mensalidade em aberto não está necessariamente em atraso.
          </p>
        </div>
      </div>

      {/* Histórico de pagamentos */}
      <div className="bg-card border border-border rounded-lg mb-5">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-tx-primary">Histórico de pagamentos</h2>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-tx-muted">Nenhum pagamento registrado.</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Recebido em</Th>
                <Th>Competência</Th>
                <Th>Valor recebido</Th>
                <Th>Observações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {payments.map(p => (
                <Tr key={p.id}>
                  <Td className="text-tx-dim">{fmtDate(p.paid_at)}</Td>
                  <Td>{fmtCompetence(p.competence)}</Td>
                  <Td>{fmtPrice(p.amount_paid)}</Td>
                  <Td className="text-tx-dim">{p.notes || '—'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Aviso */}
      <div className="bg-card-alt border border-border rounded-lg p-5">
        <p className="text-sm font-medium text-tx-primary mb-1">Informações de pagamento</p>
        <p className="text-sm text-tx-dim">
          Os pagamentos são registrados pela administração. Para realizar um pagamento ou solicitar a
          correção de um registro, procure a recepção da sua unidade. Não há pagamento online neste portal.
        </p>
      </div>
    </div>
  )
}
