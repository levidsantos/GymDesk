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

const emptyStudentForm = { name: '', email: '', phone: '', birth_date: '' }
const emptyEnrollForm  = { unit_id: '', plan_id: '', start_date: '' }

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function fmtPrice(value) {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '—'
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function Students() {
  const toast = useToast()

  // ── Planos (carregados uma vez) ────────────────────────────────────────────
  const [allPlans, setAllPlans] = useState([])

  useEffect(() => {
    apiFetch('/plans').then(d => setAllPlans(d.plans)).catch(() => {})
  }, [])

  // ── Lista de alunos ────────────────────────────────────────────────────────
  const [students,     setStudents]     = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [loading,      setLoading]      = useState(false)
  const [listError,    setListError]    = useState('')
  const [inactiveCount, setInactiveCount] = useState(0)

  const fetchStudents = useCallback(async (p, s, st) => {
    setLoading(true)
    setListError('')
    try {
      const params = new URLSearchParams({ page: p, search: s, status: st })
      const data   = await apiFetch(`/students?${params}`)
      setStudents(data.students)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (e) {
      setListError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStudents(1, '', 'active') }, [fetchStudents])

  useEffect(() => {
    apiFetch('/students?status=inactive&limit=1')
      .then(d => setInactiveCount(d.total))
      .catch(() => {})
  }, [students])

  function handleSearch(e) {
    e.preventDefault()
    fetchStudents(1, search, statusFilter)
  }

  function handleStatusFilter(value) {
    setStatusFilter(value)
    fetchStudents(1, search, value)
  }

  // ── Painel lateral — aluno ─────────────────────────────────────────────────
  const [panelMode,   setPanelMode]   = useState(null) // null | 'new' | 'edit'
  const [selected,    setSelected]    = useState(null)
  const [studentForm, setStudentForm] = useState(emptyStudentForm)
  const [stuError,    setStuError]    = useState('')
  const [stuSaving,   setStuSaving]   = useState(false)
  const [inactivating, setInactivating] = useState(false)
  const [reactivating, setReactivating] = useState(false)

  // ── Painel lateral — matrícula ─────────────────────────────────────────────
  const [activeEnrollment,  setActiveEnrollment]  = useState(null)  // matrícula ativa
  const [showEnrollForm,    setShowEnrollForm]    = useState(false)
  const [enrollForm,        setEnrollForm]        = useState(emptyEnrollForm)
  const [enrollError,       setEnrollError]       = useState('')
  const [enrollSaving,      setEnrollSaving]      = useState(false)
  const [enrollInactivating, setEnrollInactivating] = useState(false)

  // ── Painel lateral — conta de acesso ────────────────────────────────────────
  const [accountPassword, setAccountPassword] = useState('')
  const [accountError,    setAccountError]    = useState('')
  const [accountSaving,   setAccountSaving]   = useState(false)

  const plansForUnit = allPlans.filter(p => String(p.unit_id) === String(enrollForm.unit_id))

  async function loadActiveEnrollment(studentId) {
    try {
      const data = await apiFetch(`/enrollments?student_id=${studentId}&status=active&limit=1`)
      setActiveEnrollment(data.enrollments[0] ?? null)
    } catch {
      setActiveEnrollment(null)
    }
  }

  function openNew() {
    setStudentForm(emptyStudentForm)
    setStuError('')
    setSelected(null)
    setActiveEnrollment(null)
    setShowEnrollForm(false)
    setEnrollForm(emptyEnrollForm)
    setEnrollError('')
    setAccountPassword(''); setAccountError('');     setPanelMode('new')
  }

  async function openEdit(student) {
    setStuError(''); setEnrollError('')
    setShowEnrollForm(false)
    setEnrollForm(emptyEnrollForm)
    setAccountPassword(''); setAccountError('');     setStudentForm({
      name:       student.name       ?? '',
      email:      student.email      ?? '',
      phone:      student.phone      ?? '',
      birth_date: student.birth_date ?? '',
    })
    setSelected(student)
    setPanelMode('edit')
    await loadActiveEnrollment(student.id)
  }

  function closePanel() {
    setPanelMode(null)
    setSelected(null)
    setStudentForm(emptyStudentForm)
    setStuError(''); setActiveEnrollment(null)
    setShowEnrollForm(false)
    setEnrollForm(emptyEnrollForm)
    setEnrollError('')
    setAccountPassword(''); setAccountError('');   }

  function setStuField(f, v) { setStudentForm(p => ({ ...p, [f]: v })) }
  function setEnrField(f, v) {
    setEnrollForm(p => {
      const next = { ...p, [f]: v }
      if (f === 'unit_id') next.plan_id = ''  // reset plano ao trocar unidade
      return next
    })
  }

  // ── Salvar aluno ───────────────────────────────────────────────────────────

  async function handleSaveStudent(e) {
    e.preventDefault()
    setStuError(''); setStuSaving(true)
    try {
      const body = {
        name:       studentForm.name.trim(),
        email:      studentForm.email.trim()      || null,
        phone:      studentForm.phone.trim()      || null,
        birth_date: studentForm.birth_date        || null,
      }
      if (panelMode === 'new') {
        const data = await apiFetch('/students', { method: 'POST', body: JSON.stringify(body) })
        toast.success('Aluno cadastrado com sucesso.')
        fetchStudents(1, search, statusFilter)
        await openEdit(data.student)
      } else {
        const data = await apiFetch(`/students/${selected.id}`, { method: 'PUT', body: JSON.stringify(body) })
        setSelected(data.student)
        toast.success('Dados atualizados com sucesso.')
        fetchStudents(page, search, statusFilter)
      }
    } catch (e) {
      setStuError(e.message)
    } finally {
      setStuSaving(false)
    }
  }

  // ── Inativar aluno ─────────────────────────────────────────────────────────

  async function handleInactivateStudent() {
    if (!window.confirm(`Inativar ${selected.name}?\n\nA matrícula ativa será encerrada automaticamente e mensalidades futuras ainda não pagas serão canceladas.\n\nO histórico financeiro será preservado.`)) return
    setInactivating(true); setStuError('')
    try {
      await apiFetch(`/students/${selected.id}/inactivate`, { method: 'PATCH' })
      const data = await apiFetch(`/students/${selected.id}`)
      setSelected(data.student)
      setActiveEnrollment(null)
      toast.success('Aluno inativado com sucesso.')
      fetchStudents(page, search, statusFilter)
    } catch (e) {
      setStuError(e.message)
    } finally {
      setInactivating(false)
    }
  }

  // ── Reativar aluno ────────────────────────────────────────────────────────

  async function handleReactivateStudent() {
    if (!window.confirm(`Reativar ${selected.name}?`)) return
    setReactivating(true); setStuError('')
    try {
      const data = await apiFetch(`/students/${selected.id}/reactivate`, { method: 'PATCH' })
      setSelected(data.student)
      toast.success('Aluno reativado com sucesso.')
      fetchStudents(page, search, statusFilter)
    } catch (e) {
      setStuError(e.message)
    } finally {
      setReactivating(false)
    }
  }

  // ── Criar matrícula ────────────────────────────────────────────────────────

  async function handleCreateEnrollment(e) {
    e.preventDefault()
    setEnrollError('')
    setEnrollSaving(true)
    try {
      await apiFetch('/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          student_id: selected.id,
          plan_id:    Number(enrollForm.plan_id),
          start_date: enrollForm.start_date,
        }),
      })
      setShowEnrollForm(false)
      setEnrollForm(emptyEnrollForm)
      await loadActiveEnrollment(selected.id)
      toast.success('Matrícula registrada com sucesso.')
    } catch (e) {
      setEnrollError(e.message)
    } finally {
      setEnrollSaving(false)
    }
  }

  // ── Cancelar matrícula ──────────────────────────────────────────────────────

  async function handleInactivateEnrollment() {
    if (!window.confirm('Cancelar esta matrícula? Mensalidades futuras ainda não pagas serão canceladas. O cadastro do aluno permanecerá ativo.')) return
    setEnrollInactivating(true); setEnrollError('')
    try {
      await apiFetch(`/enrollments/${activeEnrollment.id}/inactivate`, { method: 'PATCH' })
      await loadActiveEnrollment(selected.id)
      toast.success('Matrícula cancelada com sucesso.')
    } catch (e) {
      setEnrollError(e.message)
    } finally {
      setEnrollInactivating(false)
    }
  }

  // ── Criar conta de acesso ───────────────────────────────────────────────────

  async function handleCreateAccount(e) {
    e.preventDefault()
    setAccountError('');     setAccountSaving(true)
    try {
      await apiFetch('/accounts', {
        method: 'POST',
        body: JSON.stringify({ student_id: selected.id, password: accountPassword }),
      })
      toast.success('Conta criada com sucesso. O aluno deverá alterar a senha no primeiro acesso.')
      setAccountPassword('')
      const data = await apiFetch(`/students/${selected.id}`)
      setSelected(data.student)
      fetchStudents(page, search, statusFilter)
    } catch (e) {
      setAccountError(e.message)
    } finally {
      setAccountSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const rangeStart = total === 0 ? 0 : (page - 1) * 20 + 1
  const rangeEnd   = Math.min(page * 20, total)

  return (
    <div>
      {/* Título */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-tx-primary">Alunos e matrículas</h1>
          <p className="text-sm text-tx-dim mt-1">
            Consulte alunos, acompanhe matrículas e faça novos cadastros.
          </p>
        </div>
        <Button onClick={openNew} className="self-start shrink-0">Novo cadastro</Button>
      </div>

      <div className={`flex gap-6 ${panelMode ? 'items-start' : ''}`}>
        {/* Lista */}
        <div className="flex-1 min-w-0">
          {/* Filtros */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
              <Input
                placeholder="Nome ou e-mail"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select
                className="w-40"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="active">Ativos</option>
                <option value="inactive">Inativos{inactiveCount > 0 ? ` (${inactiveCount})` : ''}</option>
                <option value="all">Todos</option>
              </Select>
              <Button type="submit" variant="secondary">Pesquisar</Button>
            </div>
          </form>

          {listError && <Alert variant="danger" className="mb-4">{listError}</Alert>}

          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-tx-primary">Alunos cadastrados</span>
            <span className="text-xs text-tx-muted">{total} resultado{total !== 1 ? 's' : ''}</span>
          </div>

          <Table>
            <Thead>
              <Tr>
                <Th>Aluno</Th>
                <Th>E-mail</Th>
                <Th>Telefone</Th>
                <Th>Status</Th>
                <Th>Ação</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={5} className="text-center text-tx-muted py-8">Carregando...</Td></Tr>
              ) : students.length === 0 ? (
                <Tr><Td colSpan={5} className="text-center text-tx-muted py-8">Nenhum aluno encontrado.</Td></Tr>
              ) : students.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <p className="font-medium text-tx-primary">{s.name}</p>
                    <p className="text-xs text-tx-muted">ID {s.id}</p>
                  </Td>
                  <Td><span className="text-tx-dim">{s.email || <span className="text-tx-muted">—</span>}</span></Td>
                  <Td><span className="text-tx-dim">{s.phone || <span className="text-tx-muted">—</span>}</span></Td>
                  <Td>
                    <Badge variant={s.status === 'active' ? 'success' : 'neutral'}>
                      {s.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>Ver / editar</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-tx-muted">
              {total === 0 ? '0 alunos' : `${rangeStart}–${rangeEnd} de ${total} aluno${total !== 1 ? 's' : ''}`}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1}
                onClick={() => fetchStudents(page - 1, search, statusFilter)}>Anterior</Button>
              <span className="px-3 py-1.5 text-xs bg-evolution-muted text-evolution border border-evolution-border rounded">{page}</span>
              <Button size="sm" variant="secondary" disabled={page >= totalPages}
                onClick={() => fetchStudents(page + 1, search, statusFilter)}>Próxima</Button>
            </div>
          </div>
        </div>

        {/* Painel lateral (desktop) / overlay (mobile) */}
        {panelMode && (
          <>
          {/* Backdrop mobile */}
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={closePanel} />
          <div className="
            fixed inset-x-0 bottom-0 top-12 z-50 overflow-y-auto
            md:relative md:inset-auto md:z-auto
            w-full md:w-80 md:min-w-[300px]
            bg-card border border-border rounded-t-lg md:rounded-lg p-6 self-start
          ">
            {/* Fechar mobile */}
            <button
              onClick={closePanel}
              className="absolute top-4 right-4 p-1 text-tx-muted hover:text-tx-primary transition-colors md:hidden"
            >
              <X size={18} />
            </button>

            {/* ── Dados cadastrais ── */}
            <h2 className="text-base font-semibold text-tx-primary mb-1">
              {panelMode === 'new' ? 'Cadastrar aluno' : 'Editar aluno'}
            </h2>
            <p className="text-xs text-tx-muted mb-3">Dados cadastrais do aluno.</p>

            {panelMode === 'edit' && selected && (
              <div className="flex flex-wrap gap-2 mb-5">
                <Badge variant="success">Cadastro</Badge>
                <Badge variant={selected.account_id ? 'success' : 'neutral'}>
                  {selected.account_id ? 'Conta criada' : 'Sem conta'}
                </Badge>
                <Badge variant={activeEnrollment ? 'success' : 'neutral'}>
                  {activeEnrollment ? 'Matrícula ativa' : 'Sem matrícula'}
                </Badge>
              </div>
            )}


            {stuError   && <Alert variant="danger"  className="mb-4">{stuError}</Alert>}

            <form onSubmit={handleSaveStudent} className="flex flex-col gap-4">
              <InputField label="Nome completo">
                <Input placeholder="Nome completo" value={studentForm.name}
                  onChange={(e) => setStuField('name', e.target.value)} required />
              </InputField>
              <InputField label="E-mail">
                <Input type="email" placeholder="nome@email.com" value={studentForm.email}
                  onChange={(e) => setStuField('email', e.target.value)} />
              </InputField>
              <InputField label="Telefone">
                <Input type="tel" placeholder="(00) 00000-0000" value={studentForm.phone}
                  onChange={(e) => setStuField('phone', e.target.value)} />
              </InputField>
              <InputField label="Data de nascimento">
                <Input type="date" value={studentForm.birth_date}
                  onChange={(e) => setStuField('birth_date', e.target.value)} />
              </InputField>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="secondary" className="flex-1" onClick={closePanel}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={stuSaving}>
                  {stuSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>

            {/* Inativar aluno */}
            {panelMode === 'edit' && selected?.status === 'active' && (
              <div className="mt-4">
                <Button variant="secondary"
                  className="w-full text-power border-power/30 hover:bg-power-muted"
                  onClick={handleInactivateStudent} disabled={inactivating}>
                  {inactivating ? 'Inativando...' : 'Inativar aluno'}
                </Button>
              </div>
            )}

            {panelMode === 'edit' && selected?.status === 'inactive' && (
              <div className="mt-4">
                <Button variant="secondary"
                  className="w-full text-success border-success/30 hover:bg-success/10"
                  onClick={handleReactivateStudent} disabled={reactivating}>
                  {reactivating ? 'Reativando...' : 'Reativar aluno'}
                </Button>
              </div>
            )}

            {/* ── Seção de conta de acesso (só no modo edição) ── */}
            {panelMode === 'edit' && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-tx-primary mb-4">Conta de acesso</h3>

                {accountError   && <Alert variant="danger"  className="mb-4">{accountError}</Alert>}

                {selected?.account_id ? (
                  <p className="text-xs text-tx-muted">
                    Este aluno já possui uma conta vinculada.
                  </p>
                ) : !selected?.email ? (
                  <p className="text-xs text-tx-muted">
                    O aluno precisa ter um e-mail cadastrado para criar uma conta.
                  </p>
                ) : (
                  <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
                    <p className="text-xs text-tx-muted">
                      Criar conta para <span className="text-tx-primary">{selected.email}</span>
                    </p>
                    <InputField label="Senha provisória">
                      <Input
                        type="text"
                        placeholder="Mínimo 6 caracteres"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        required
                      />
                    </InputField>
                    <p className="text-xs text-tx-muted">
                      O aluno será obrigado a alterar a senha no primeiro acesso.
                    </p>
                    <Button type="submit" variant="secondary" className="w-full" disabled={accountSaving}>
                      {accountSaving ? 'Criando...' : 'Criar conta'}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* ── Seção de matrícula (só no modo edição) ── */}
            {panelMode === 'edit' && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-tx-primary mb-4">Matrícula</h3>

                {enrollError && <Alert variant="danger" className="mb-4">{enrollError}</Alert>}

                {activeEnrollment ? (
                  /* Matrícula ativa */
                  <div className="flex flex-col gap-3">
                    <div className="bg-card-alt border border-border rounded-lg p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${activeEnrollment.unit_slug === 'evolution' ? 'text-evolution' : 'text-power'}`}>
                          {activeEnrollment.unit_name}
                        </span>
                        <Badge variant="success">Ativa</Badge>
                      </div>
                      <p className="text-sm text-tx-primary">{activeEnrollment.plan_name}</p>
                      <p className="text-xs text-tx-muted">{fmtPrice(activeEnrollment.plan_monthly_price)}/mês</p>
                      <p className="text-xs text-tx-muted">
                        {fmtDate(activeEnrollment.start_date)} → {fmtDate(activeEnrollment.end_date)}
                      </p>
                    </div>
                    <Button variant="secondary"
                      className="w-full text-power border-power/30 hover:bg-power-muted"
                      onClick={handleInactivateEnrollment} disabled={enrollInactivating}>
                      {enrollInactivating ? 'Cancelando...' : 'Cancelar matrícula'}
                    </Button>
                    <p className="text-xs text-tx-muted text-center">Mensalidades futuras serão canceladas.</p>
                  </div>
                ) : showEnrollForm ? (
                  /* Formulário de nova matrícula */
                  <form onSubmit={handleCreateEnrollment} className="flex flex-col gap-4">
                    <InputField label="Unidade">
                      <Select value={enrollForm.unit_id} onChange={(e) => setEnrField('unit_id', e.target.value)} required>
                        <option value="">Selecione a unidade</option>
                        {[...new Map(allPlans.map(p => [p.unit_id, p])).values()].map(p => (
                          <option key={p.unit_id} value={p.unit_id}>{p.unit_name}</option>
                        ))}
                      </Select>
                    </InputField>
                    <InputField label="Plano">
                      <Select value={enrollForm.plan_id} onChange={(e) => setEnrField('plan_id', e.target.value)}
                        disabled={!enrollForm.unit_id} required>
                        <option value="">
                          {enrollForm.unit_id ? 'Selecione o plano' : 'Selecione a unidade primeiro'}
                        </option>
                        {plansForUnit.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {fmtPrice(p.monthly_price)}/mês
                          </option>
                        ))}
                      </Select>
                    </InputField>
                    <InputField label="Início">
                      <Input type="date" value={enrollForm.start_date}
                        onChange={(e) => setEnrField('start_date', e.target.value)} required />
                    </InputField>
                    <p className="text-xs text-tx-muted">
                      As mensalidades serão geradas automaticamente para todo o período contratado.
                    </p>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" className="flex-1"
                        onClick={() => { setShowEnrollForm(false); setEnrollForm(emptyEnrollForm); setEnrollError('') }}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1" disabled={enrollSaving}>
                        {enrollSaving ? 'Salvando...' : 'Matricular'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Sem matrícula ativa */
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-tx-muted">Nenhuma matrícula ativa.</p>
                    {selected?.status === 'active' && (
                      <Button variant="secondary" className="w-full"
                        onClick={() => { setShowEnrollForm(true); setEnrollError('') }}>
                        Registrar matrícula
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </div>
  )
}
