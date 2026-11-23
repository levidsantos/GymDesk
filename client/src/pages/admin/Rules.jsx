import { useState } from 'react'
import { apiFetch } from '../../lib/api'
import { Input, InputField, Select } from '../../components/Input'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'

const accessRules = [
  { plan: 'Qualquer plano', origin: 'Muscle Power',     power: 'Permitido',      evolution: 'Domingos apenas' },
  { plan: 'Qualquer plano', origin: 'Muscle Evolution',  power: 'Permitido',      evolution: 'Permitido'       },
]

export default function Rules() {
  const [studentSearch, setStudentSearch] = useState('')
  const [students,      setStudents]      = useState([])
  const [selectedId,    setSelectedId]    = useState('')
  const [unitSlug,      setUnitSlug]      = useState('power')
  const [result,        setResult]        = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')

  async function searchStudents() {
    if (!studentSearch.trim()) return
    try {
      const data = await apiFetch(`/students?search=${encodeURIComponent(studentSearch)}&status=all&limit=10`)
      setStudents(data.students)
      setSelectedId(data.students[0]?.id ?? '')
    } catch (e) {
      setError(e.message)
    }
  }

  async function checkAccess(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!selectedId) { setError('Selecione um aluno.'); return }
    setLoading(true)
    try {
      const data = await apiFetch(`/access/check?student_id=${selectedId}&unit_slug=${unitSlug}`)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-tx-primary">Regras de acesso</h1>
        <p className="text-sm text-tx-dim mt-1">
          Condições de utilização das unidades Muscle Power e Muscle Evolution.
        </p>
      </div>

      {/* Verificação de acesso */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-tx-primary mb-5">Verificar acesso de aluno</h2>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        <form onSubmit={checkAccess} className="flex flex-col gap-4">
          <div className="flex gap-3 items-end">
            <InputField label="Aluno" className="flex-1">
              <Input
                placeholder="Pesquise pelo nome"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchStudents() } }}
              />
            </InputField>
            <Button type="button" variant="secondary" onClick={searchStudents}>Buscar</Button>
          </div>

          {students.length > 0 && (
            <InputField label="Selecionar aluno">
              <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.status === 'inactive' ? ' (inativo)' : ''} — {s.email || 'sem e-mail'}
                  </option>
                ))}
              </Select>
            </InputField>
          )}

          <InputField label="Unidade pretendida">
            <Select value={unitSlug} onChange={(e) => setUnitSlug(e.target.value)}>
              <option value="power">Muscle Power</option>
              <option value="evolution">Muscle Evolution</option>
            </Select>
          </InputField>

          <Button type="submit" disabled={loading || !selectedId} className="self-start">
            {loading ? 'Verificando...' : 'Verificar acesso'}
          </Button>
        </form>

        {result && (
          <div className={`mt-5 p-4 rounded-lg border ${
            result.allowed
              ? 'bg-success/5 border-success/20'
              : 'bg-danger/5 border-danger/20'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={result.allowed ? 'success' : 'danger'}>
                {result.allowed ? 'Autorizado' : 'Negado'}
              </Badge>
              <span className="text-sm font-medium text-tx-primary">{result.student_name}</span>
            </div>
            <p className="text-sm text-tx-dim mb-1">
              Unidade: <span className="text-tx-primary">{result.unit_name}</span>
              {result.origin_name && (
                <> · Origem: <span className="text-tx-primary">{result.origin_name}</span></>
              )}
            </p>
            <p className="text-sm text-tx-dim">
              {result.checked_at?.day}, verificado às {
                `${String(Math.floor(result.checked_at.minutes / 60)).padStart(2, '0')}:${String(result.checked_at.minutes % 60).padStart(2, '0')}`
              }
            </p>
            <p className="text-sm text-tx-primary mt-2 font-medium">{result.reason}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
        {/* Condições obrigatórias */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-tx-primary mb-5">Condições obrigatórias</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-tx-dim uppercase tracking-wide mb-1">Situação da matrícula</p>
              <p className="text-sm text-tx-primary">Matrícula ativa é obrigatória para acesso.</p>
            </div>
            <div>
              <p className="text-xs font-medium text-tx-dim uppercase tracking-wide mb-1">Situação financeira</p>
              <p className="text-sm text-tx-primary">Não são permitidas mensalidades em atraso.</p>
              <p className="text-xs text-tx-muted mt-1">Mensalidades em aberto, ainda não vencidas, não impedem o acesso.</p>
            </div>
          </div>
        </div>

        {/* Horários */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-tx-primary mb-5">Funcionamento das unidades</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-power mb-1">Muscle Power</p>
              <p className="text-sm text-tx-dim">Segunda a sexta: 05h às 21h</p>
              <p className="text-sm text-tx-dim">Sábado: 08h às 12h</p>
              <p className="text-sm text-tx-dim">Domingo: fechada</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-evolution mb-1">Muscle Evolution</p>
              <p className="text-sm text-tx-dim">Segunda a sexta: 05h às 21h</p>
              <p className="text-sm text-tx-dim">Sábado: 07h às 13h</p>
              <p className="text-sm text-tx-dim">Domingo: 08h às 12h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de acesso */}
      <div className="bg-card border border-border rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-tx-primary">Acesso por unidade de origem</h2>
        </div>
        <Table>
          <Thead>
            <Tr>
              <Th>Plano</Th>
              <Th>Unidade de origem</Th>
              <Th>Muscle Power</Th>
              <Th>Muscle Evolution</Th>
            </Tr>
          </Thead>
          <Tbody>
            {accessRules.map((r, i) => (
              <Tr key={i}>
                <Td className="text-tx-dim">{r.plan}</Td>
                <Td>
                  <span className={`text-sm font-medium ${r.origin === 'Muscle Evolution' ? 'text-evolution' : 'text-power'}`}>
                    {r.origin}
                  </span>
                </Td>
                <Td><span className="text-success text-sm">{r.power}</span></Td>
                <Td>
                  <span className={`text-sm ${r.evolution === 'Permitido' ? 'text-success' : 'text-warning'}`}>
                    {r.evolution}
                  </span>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <div className="px-6 py-3 border-t border-border text-xs text-tx-muted">
          Regras iguais para todos os planos, independentemente da duração contratada.
        </div>
      </div>

      {/* Aviso */}
      <div className="bg-card-alt border border-border rounded-lg p-5">
        <p className="text-sm font-medium text-tx-primary mb-1">Aplicação das regras</p>
        <p className="text-sm text-tx-dim">
          As regras são exibidas na área do aluno como informação. Não há integração com catracas ou equipamentos físicos.
        </p>
      </div>
    </div>
  )
}
