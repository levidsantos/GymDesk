import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import { Input, InputField, Select } from '../../components/Input'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'
import { useToast } from '../../components/Toast'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function fmtCompetence(yyyymm) {
  if (!yyyymm) return '—'
  const [y, m] = yyyymm.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${months[parseInt(m) - 1]}/${y}`
}

function fmtPrice(value) {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '—'
}

function installmentBadge(inst) {
  if (inst.status === 'paid')      return { variant: 'success', label: 'Pago' }
  if (inst.status === 'cancelled') return { variant: 'neutral', label: 'Cancelada' }
  if (inst.is_overdue)             return { variant: 'danger',  label: 'Em atraso' }
  return { variant: 'warning', label: 'Em aberto' }
}

const todayISO = () => new Date().toISOString().slice(0, 10)

// ── Componente ───────────────────────────────────────────────────────────────

export default function Payments() {
  const toast = useToast()

  // ── Mensalidades ───────────────────────────────────────────────────────────
  const [installments, setInstallments] = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading,      setLoading]      = useState(false)
  const [listError,    setListError]    = useState('')

  const fetchInstallments = useCallback(async (p, s, st) => {
    setLoading(true)
    setListError('')
    try {
      const params = new URLSearchParams({ page: p, search: s, status: st, limit: 30 })
      const data   = await apiFetch(`/installments?${params}`)
      setInstallments(data.installments)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
      if (data.summary) setSummary(data.summary)
    } catch (e) {
      setListError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInstallments(1, '', 'all') }, [fetchInstallments])

  function handleSearch(e) {
    e.preventDefault()
    fetchInstallments(1, search, statusFilter)
  }

  // ── Painel de pagamento ────────────────────────────────────────────────────
  const [selected,     setSelected]     = useState(null)   // installment a pagar
  const [payForm,      setPayForm]      = useState({ paid_at: '', amount_paid: '', notes: '' })
  const [payError,     setPayError]     = useState('')
  const [paySaving,    setPaySaving]    = useState(false)
  const [lastPayment,  setLastPayment]  = useState(null)   // confirmação pós-registro

  function openPay(inst) {
    setPayError('')
    setLastPayment(null)
    setPayForm({
      paid_at:    todayISO(),
      amount_paid: String(inst.amount),
      notes:      '',
    })
    setSelected(inst)
  }

  function closePay() {
    setSelected(null)
    setLastPayment(null)
    setPayError('')
  }

  async function handleRegister(e) {
    e.preventDefault()
    setPayError('')
    setPaySaving(true)
    try {
      const data = await apiFetch(`/installments/${selected.id}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          paid_at:     payForm.paid_at,
          amount_paid: parseFloat(payForm.amount_paid),
          notes:       payForm.notes.trim() || null,
        }),
      })
      setLastPayment({ installment: data.installment, payment: data.payment })
      setSelected(null)
      toast.success('Pagamento registrado com sucesso.')
      fetchInstallments(page, search, statusFilter)
      fetchHistory()
    } catch (e) {
      setPayError(e.message)
    } finally {
      setPaySaving(false)
    }
  }

  // ── Histórico ──────────────────────────────────────────────────────────────
  const [history,      setHistory]      = useState([])
  const [historyError, setHistoryError] = useState('')

  const fetchHistory = useCallback(async () => {
    try {
      const data = await apiFetch('/payments?limit=10')
      setHistory(data.payments)
    } catch (e) {
      setHistoryError(e.message)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  // ── Resumo financeiro (totais do backend, não apenas da página) ─────────
  const [summary, setSummary] = useState({ overdue: 0, pending: 0, paid: 0 })

  const rangeStart = total === 0 ? 0 : (page - 1) * 30 + 1
  const rangeEnd   = Math.min(page * 30, total)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-tx-primary">Mensalidades</h1>
        <p className="text-sm text-tx-dim mt-1">
          Consulte vencimentos e registre pagamentos recebidos pela academia.
        </p>
      </div>

      {/* Filtros */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
          <Input
            placeholder="Pesquisar aluno"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Select
            className="flex-1 sm:w-44"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); fetchInstallments(1, search, e.target.value) }}
          >
            <option value="all">Todas as situações</option>
            <option value="pending">Em aberto</option>
            <option value="overdue">Em atraso</option>
            <option value="paid">Pagas</option>
            <option value="cancelled">Canceladas</option>
          </Select>
          <Button type="submit" variant="secondary">Pesquisar</Button>
        </div>
      </form>

      {listError && <Alert variant="danger" className="mb-4">{listError}</Alert>}

      <div className="flex gap-6 items-start">
        {/* Lista */}
        <div className="flex-1 min-w-0">

          {/* Resumo rápido */}
          {(summary.overdue > 0 || summary.pending > 0 || summary.paid > 0) && (
            <div className="flex gap-3 mb-4 text-xs text-tx-muted">
              {summary.overdue > 0 && (
                <span className="text-danger font-medium">{summary.overdue} em atraso</span>
              )}
              {summary.pending > 0 && (
                <span>{summary.pending} em aberto</span>
              )}
              {summary.paid > 0 && (
                <span className="text-success">{summary.paid} paga{summary.paid !== 1 ? 's' : ''}</span>
              )}
            </div>
          )}

          <Table>
            <Thead>
              <Tr>
                <Th>Aluno</Th>
                <Th>Unidade / Plano</Th>
                <Th>Competência</Th>
                <Th>Vencimento</Th>
                <Th>Valor</Th>
                <Th>Situação</Th>
                <Th>Ação</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={7} className="text-center text-tx-muted py-8">Carregando...</Td></Tr>
              ) : installments.length === 0 ? (
                <Tr><Td colSpan={7} className="text-center text-tx-muted py-8">Nenhuma mensalidade encontrada.</Td></Tr>
              ) : installments.map((inst) => {
                const badge = installmentBadge(inst)
                return (
                  <Tr key={inst.id}>
                    <Td>
                      <span className="font-medium text-tx-primary">{inst.student_name}</span>
                    </Td>
                    <Td>
                      <span className={`text-xs font-medium ${inst.unit_slug === 'evolution' ? 'text-evolution' : 'text-power'}`}>
                        {inst.unit_name}
                      </span>
                      <p className="text-xs text-tx-muted">{inst.plan_name}</p>
                    </Td>
                    <Td>{fmtCompetence(inst.competence)}</Td>
                    <Td className="text-tx-dim">{fmtDate(inst.due_date)}</Td>
                    <Td>{fmtPrice(inst.amount)}</Td>
                    <Td><Badge variant={badge.variant}>{badge.label}</Badge></Td>
                    <Td>
                      {inst.status === 'pending' ? (
                        <Button size="sm" onClick={() => openPay(inst)}>Registrar</Button>
                      ) : (
                        <span className="text-xs text-tx-muted">—</span>
                      )}
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-tx-muted">
              {total === 0 ? '0 mensalidades' : `${rangeStart}–${rangeEnd} de ${total}`}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1}
                onClick={() => fetchInstallments(page - 1, search, statusFilter)}>Anterior</Button>
              <span className="px-3 py-1.5 text-xs bg-evolution-muted text-evolution border border-evolution-border rounded">{page}</span>
              <Button size="sm" variant="secondary" disabled={page >= totalPages}
                onClick={() => fetchInstallments(page + 1, search, statusFilter)}>Próxima</Button>
            </div>
          </div>

          {/* Histórico de pagamentos */}
          <div className="bg-card border border-border rounded-lg p-5 mt-6">
            <h2 className="text-sm font-semibold text-tx-primary mb-3">Histórico de pagamentos</h2>
            {historyError && <p className="text-xs text-danger">{historyError}</p>}
            {history.length === 0 ? (
              <p className="text-sm text-tx-muted">Nenhum pagamento registrado.</p>
            ) : (
              <div className="space-y-2 text-sm text-tx-dim">
                {history.map((p) => (
                  <p key={p.id}>
                    {fmtCompetence(p.competence)} · {p.student_name} ·{' '}
                    Recebido em {fmtDate(p.paid_at)} · {fmtPrice(p.amount_paid)}
                    {p.notes && ` · ${p.notes}`}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel de registro / confirmação */}
        {/* Mobile: overlay quando ativo; Desktop: sempre visível como side panel */}
        {(selected || lastPayment) && (
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={closePay} />
        )}
        <div className={`
          ${selected || lastPayment
            ? 'fixed inset-x-0 bottom-0 top-12 z-50 overflow-y-auto md:relative md:inset-auto md:z-auto w-full'
            : 'hidden md:block'
          }
          md:w-72 md:min-w-[260px] bg-card border border-border rounded-t-lg md:rounded-lg p-6 self-start
        `}>
          {/* Fechar mobile */}
          {(selected || lastPayment) && (
            <button
              onClick={closePay}
              className="absolute top-4 right-4 p-1 text-tx-muted hover:text-tx-primary transition-colors md:hidden"
            >
              <X size={18} />
            </button>
          )}

          {lastPayment ? (
            /* Confirmação */
            <>
              <h2 className="text-base font-semibold text-tx-primary mb-3">Registro confirmado</h2>
              <Badge variant="success" className="mb-4">Pago</Badge>
              <p className="text-3xl font-bold text-tx-primary mb-1">
                {fmtPrice(lastPayment.payment.amount_paid)}
              </p>
              <p className="text-xs text-tx-dim mb-4">
                {lastPayment.installment.student_name} · Mensalidade de {fmtCompetence(lastPayment.installment.competence)}
              </p>
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-tx-muted">Recebido em</span>
                  <span className="font-medium">{fmtDate(lastPayment.payment.paid_at)}</span>
                </div>
                {lastPayment.payment.notes && (
                  <div className="flex justify-between">
                    <span className="text-tx-muted">Observação</span>
                    <span className="font-medium text-right max-w-[140px]">{lastPayment.payment.notes}</span>
                  </div>
                )}
              </div>
              <Button className="w-full mt-5" onClick={closePay}>
                Voltar às mensalidades
              </Button>
            </>
          ) : selected ? (
            /* Formulário */
            <>
              <h2 className="text-base font-semibold text-tx-primary mb-1">Registrar pagamento</h2>
              <Badge variant={selected.is_overdue ? 'danger' : 'warning'} className="mb-4">
                {selected.is_overdue ? 'Em atraso' : 'Em aberto'}
              </Badge>
              <p className="text-xs text-tx-dim mb-5">
                {selected.student_name} · {fmtCompetence(selected.competence)}<br />
                Vencimento em {fmtDate(selected.due_date)}
              </p>

              {payError && <Alert variant="danger" className="mb-4">{payError}</Alert>}

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <InputField label="Valor recebido">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={payForm.amount_paid}
                    onChange={(e) => setPayForm(f => ({ ...f, amount_paid: e.target.value }))}
                    required
                  />
                </InputField>
                <InputField label="Data do pagamento">
                  <Input
                    type="date"
                    value={payForm.paid_at}
                    onChange={(e) => setPayForm(f => ({ ...f, paid_at: e.target.value }))}
                    required
                  />
                </InputField>
                <InputField label="Observação (opcional)">
                  <Input
                    placeholder="Dinheiro, Pix, etc."
                    value={payForm.notes}
                    onChange={(e) => setPayForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </InputField>
                <p className="text-xs text-tx-muted">
                  Registro administrativo de um valor já recebido. Nenhum pagamento online é realizado.
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={closePay}>Cancelar</Button>
                  <Button type="submit" className="flex-1" disabled={paySaving}>
                    {paySaving ? 'Salvando...' : 'Registrar'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <p className="text-sm text-tx-muted">
              Selecione uma mensalidade em aberto para registrar o pagamento.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
