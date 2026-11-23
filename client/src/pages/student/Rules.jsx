import { useState, useEffect } from 'react'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'

async function apiFetch(path) {
  const res = await fetch(`/api${path}`, { credentials: 'include' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição.')
  return data
}

function fmtPrice(v) {
  return v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '—'
}

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function StudentRules() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    apiFetch('/portal/access')
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

  const { student, enrollment, overdue_count, next_pending_due, access } = data

  if (!student) {
    return <Alert variant="warning">Conta não vinculada a um cadastro de aluno.</Alert>
  }

  const isPower = enrollment?.unit_slug === 'power'

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-tx-primary">Regras de acesso</h1>
        <p className="text-sm text-tx-dim mt-1">
          Confira as condições para utilizar a Muscle Power e a Muscle Evolution.
        </p>
      </div>

      {/* Suas condições */}
      <div className="bg-card border border-border rounded-lg p-6 mb-5">
        <h2 className="text-base font-semibold text-tx-primary mb-4">Suas condições de acesso</h2>

        {!enrollment ? (
          <p className="text-sm text-tx-muted">
            Você não possui matrícula ativa. O acesso às unidades requer matrícula ativa e situação financeira regular.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-tx-muted uppercase tracking-wide mb-1">Plano contratado</p>
                <p className="font-semibold text-tx-primary">
                  {enrollment.plan_name} · {fmtPrice(enrollment.plan_monthly_price)}/mês
                </p>
              </div>
              <div>
                <p className="text-xs text-tx-muted uppercase tracking-wide mb-1">Matrícula</p>
                <Badge variant="success">Ativa</Badge>
              </div>
              <div>
                <p className="text-xs text-tx-muted uppercase tracking-wide mb-1">Mensalidades vencidas</p>
                {overdue_count > 0 ? (
                  <p className="font-semibold text-danger">
                    {overdue_count} mensalidade{overdue_count > 1 ? 's' : ''}
                  </p>
                ) : (
                  <p className="font-semibold text-success">Nenhuma</p>
                )}
              </div>
            </div>
            {next_pending_due && overdue_count === 0 && (
              <p className="text-xs text-tx-muted mt-4">
                A próxima mensalidade vence em {fmtDate(next_pending_due)} e não impede o acesso antes do vencimento.
              </p>
            )}
          </>
        )}
      </div>

      {/* Cards das unidades */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Muscle Power */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-power">Muscle Power</h2>
            {access ? (
              <Badge variant={access.power.allowed ? 'success' : 'danger'}>
                {access.power.allowed ? 'Acesso permitido' : 'Sem acesso'}
              </Badge>
            ) : (
              <Badge variant="neutral">Sem matrícula</Badge>
            )}
          </div>
          <p className="text-sm text-tx-dim mb-4">
            {!enrollment
              ? 'Requer matrícula ativa.'
              : isPower
                ? 'Sua unidade de origem.'
                : 'Acesso incluído no seu plano Muscle Evolution.'
            }
          </p>
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-tx-dim uppercase tracking-wide mb-2">
              Horário de funcionamento
            </p>
            <div className="space-y-1 text-sm text-tx-primary">
              <p>Segunda a sexta: <span className="text-tx-dim">05h às 21h</span></p>
              <p>Sábado: <span className="text-tx-dim">08h às 12h</span></p>
              <p>Domingo: <span className="text-danger">fechada</span></p>
            </div>
          </div>
        </div>

        {/* Muscle Evolution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-evolution">Muscle Evolution</h2>
            {access ? (
              isPower ? (
                <Badge variant={access.evolution.allowed ? 'success' : 'warning'}>
                  {access.evolution.allowed ? 'Acesso permitido' : 'Somente aos domingos'}
                </Badge>
              ) : (
                <Badge variant={access.evolution.allowed ? 'success' : 'danger'}>
                  {access.evolution.allowed ? 'Acesso permitido' : 'Sem acesso'}
                </Badge>
              )
            ) : (
              <Badge variant="neutral">Sem matrícula</Badge>
            )}
          </div>
          <p className="text-sm text-tx-dim mb-4">
            {!enrollment
              ? 'Requer matrícula ativa.'
              : isPower
                ? 'Alunos da Muscle Power podem utilizar a Muscle Evolution somente aos domingos, durante o horário de funcionamento.'
                : 'Sua unidade de origem.'
            }
          </p>
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-tx-dim uppercase tracking-wide mb-2">
              Horário de funcionamento
            </p>
            <div className="space-y-1 text-sm text-tx-primary">
              <p>Segunda a sexta: <span className="text-tx-dim">05h às 21h</span></p>
              <p>Sábado: <span className="text-tx-dim">07h às 13h</span></p>
              <p>Domingo: <span className="text-tx-dim">08h às 12h</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Como funcionam as regras */}
      <div className="bg-card border border-border rounded-lg mb-5">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-tx-primary">Como funcionam as regras</h2>
        </div>
        <Table>
          <Thead>
            <Tr>
              <Th>Condição</Th>
              <Th>Regra aplicada</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td className="text-tx-dim">Situação da matrícula</Td>
              <Td className="font-medium">É necessário manter a matrícula ativa.</Td>
            </Tr>
            <Tr>
              <Td className="text-tx-dim">Situação financeira</Td>
              <Td className="font-medium">
                Não pode haver mensalidades vencidas. Mensalidades ainda não vencidas não impedem o acesso.
              </Td>
            </Tr>
            <Tr>
              <Td className="text-tx-dim">Acesso entre unidades</Td>
              <Td className="font-medium">
                Muscle Power: acesso à própria unidade + Muscle Evolution aos domingos.<br />
                Muscle Evolution: acesso às duas unidades.
              </Td>
            </Tr>
          </Tbody>
        </Table>
        <div className="px-6 py-3 border-t border-border">
          <p className="text-xs text-tx-muted">Regras definidas pela administração da academia.</p>
        </div>
      </div>

      {/* Dúvidas */}
      <div className="bg-card-alt border border-border rounded-lg p-5">
        <p className="text-sm font-medium text-tx-primary mb-1">Dúvidas sobre seu acesso?</p>
        <p className="text-sm text-tx-dim">
          Procure a recepção da sua unidade para esclarecer as regras ou regularizar sua matrícula e mensalidades.
        </p>
      </div>
    </div>
  )
}
