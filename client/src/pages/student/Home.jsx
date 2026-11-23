import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Alert from '../../components/Alert'

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
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return `${months[parseInt(m) - 1]} de ${y}`
}

export default function StudentHome({ onNavigate }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    apiFetch('/portal/home')
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

  const { student, enrollment, finance, access } = data

  if (!student) {
    return <Alert variant="warning">Conta não vinculada a um cadastro de aluno.</Alert>
  }

  const firstName = student.name.split(' ')[0]

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-tx-primary">Olá, {firstName}</h1>
        <p className="text-sm text-tx-dim mt-1">
          Acompanhe sua matrícula, mensalidades e o acesso às unidades.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Matrícula */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-tx-primary">Minha matrícula</h2>
            {enrollment ? (
              <Badge variant="success">Ativa</Badge>
            ) : (
              <Badge variant="neutral">Sem matrícula</Badge>
            )}
          </div>
          <p className="text-lg font-semibold text-tx-primary mb-4">{student.name}</p>

          {enrollment ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-tx-muted">Plano</span>
                <span className="text-tx-primary font-medium">
                  {enrollment.plan_name} · {fmtPrice(enrollment.plan_monthly_price)}/mês
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-tx-muted">Unidade de origem</span>
                <span className={`font-medium ${enrollment.unit_slug === 'evolution' ? 'text-evolution' : 'text-power'}`}>
                  {enrollment.unit_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-tx-muted">Período</span>
                <span className="text-tx-primary">{fmtDate(enrollment.start_date)} → {fmtDate(enrollment.end_date)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-tx-muted">
              Você não possui matrícula ativa no momento. Procure a recepção para mais informações.
            </p>
          )}
        </div>

        {/* Próxima mensalidade */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-tx-primary mb-4">Situação financeira</h2>

          {!enrollment ? (
            <p className="text-sm text-tx-muted">Sem matrícula ativa.</p>
          ) : finance?.overdue_count > 0 ? (
            <>
              <Badge variant="danger" className="mb-3">
                {finance.overdue_count} mensalidade{finance.overdue_count > 1 ? 's' : ''} em atraso
              </Badge>
              <p className="text-3xl font-bold text-danger mt-2 mb-1">{fmtPrice(finance.overdue_amount)}</p>
              <p className="text-sm text-tx-dim mb-5">em mensalidades vencidas e não pagas.</p>
            </>
          ) : finance?.next_pending ? (
            <>
              <Badge variant="warning" className="mb-3">Em aberto · Ainda não vencida</Badge>
              <p className="text-3xl font-bold text-tx-primary mt-2 mb-1">{fmtPrice(finance.next_pending.amount)}</p>
              <p className="text-sm text-tx-dim mb-1">
                {fmtCompetence(finance.next_pending.competence)} · Vencimento em {fmtDate(finance.next_pending.due_date)}
              </p>
              <p className="text-xs text-success mb-5">Você não possui mensalidades em atraso.</p>
            </>
          ) : (
            <p className="text-sm text-success">Todas as mensalidades estão pagas.</p>
          )}

          {enrollment && (
            <Button variant="secondary" size="sm" onClick={() => onNavigate('finance')}>
              Ver situação financeira
            </Button>
          )}
        </div>
      </div>

      {/* Resumo de acesso */}
      {access && (
        <div className={`rounded-lg p-5 mb-5 ${
          access.power.allowed || access.evolution.allowed
            ? 'bg-evolution-muted border border-evolution-border'
            : 'bg-danger/5 border border-danger/20'
        }`}>
          {enrollment.unit_slug === 'power' ? (
            <>
              <p className={`text-sm font-semibold mb-1 ${access.power.allowed ? 'text-evolution' : 'text-danger'}`}>
                {access.power.allowed
                  ? 'Acesso à Muscle Power autorizado'
                  : `Acesso à Muscle Power: ${access.power.reason}`
                }
              </p>
              <p className="text-sm text-tx-dim">
                {access.evolution.allowed
                  ? 'Acesso à Muscle Evolution também autorizado neste momento.'
                  : `Muscle Evolution: ${access.evolution.reason}`
                }
              </p>
            </>
          ) : (
            <>
              <p className={`text-sm font-semibold mb-1 ${access.power.allowed && access.evolution.allowed ? 'text-evolution' : 'text-danger'}`}>
                {access.evolution.allowed
                  ? 'Acesso às duas unidades autorizado'
                  : `Acesso: ${access.evolution.reason}`
                }
              </p>
              <p className="text-sm text-tx-dim">
                Seu plano Muscle Evolution inclui acesso às duas unidades.
              </p>
            </>
          )}
        </div>
      )}

      {/* Acesso rápido */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-semibold text-tx-primary mb-5">Acesso rápido</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div>
            <p className="text-sm font-semibold text-tx-primary mb-1">Situação financeira</p>
            <p className="text-sm text-tx-dim mb-3">
              Consulte mensalidades, vencimentos e o histórico dos pagamentos registrados pela academia.
            </p>
            <Button onClick={() => onNavigate('finance')}>Consultar mensalidades</Button>
          </div>
          <div>
            <p className="text-sm font-semibold text-tx-primary mb-1">Regras de acesso</p>
            <p className="text-sm text-tx-dim mb-3">
              Saiba em quais unidades você pode entrar e quais condições precisa manter.
            </p>
            <Button variant="secondary" onClick={() => onNavigate('rules')}>Consultar regras</Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-tx-muted mt-5 text-center">
        Para atualizar dados da matrícula ou informar um pagamento, procure a recepção da sua unidade.
      </p>
    </div>
  )
}
