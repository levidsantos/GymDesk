import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input, InputField, Select } from '../../components/Input'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'

// Dataset coerente — referência 21/11/2026
// Power: Carlos (Anual R$50), Rafael (Mensal R$60), Lucas (Semestral R$55)
// Evolution: Beatriz (Semestral R$90), Juliana (Trimestral R$95 — inativa)
const students = [
  { name: 'Carlos Mendes',  id: 'GD-0017', unit: 'Muscle Power',     plan: 'Anual',      value: 'R$ 50,00/mês', status: 'Ativa',   since: '05/03/2026' },
  { name: 'Beatriz Souza',  id: 'GD-0028', unit: 'Muscle Evolution', plan: 'Semestral',  value: 'R$ 90,00/mês', status: 'Ativa',   since: '10/08/2026' },
  { name: 'Rafael Torres',  id: 'GD-0035', unit: 'Muscle Power',     plan: 'Mensal',     value: 'R$ 60,00/mês', status: 'Ativa',   since: '15/10/2026' },
  { name: 'Juliana Costa',  id: 'GD-0039', unit: 'Muscle Evolution', plan: 'Trimestral', value: 'R$ 95,00/mês', status: 'Inativa', since: '01/09/2026' },
  { name: 'Lucas Ferreira', id: 'GD-0043', unit: 'Muscle Power',     plan: 'Semestral',  value: 'R$ 55,00/mês', status: 'Ativa',   since: '20/06/2026' },
]

const plansByUnit = {
  power:     ['Mensal', 'Semestral', 'Anual'],
  evolution: ['Mensal', 'Trimestral', 'Semestral', 'Anual'],
}

export default function Students() {
  const [showForm, setShowForm] = useState(false)
  const [formUnit, setFormUnit] = useState('')

  function openForm() {
    setFormUnit('')
    setShowForm(true)
  }

  function closeForm() {
    setFormUnit('')
    setShowForm(false)
  }

  return (
    <div>
      {/* Título */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-tx-primary">Alunos e matrículas</h1>
          <p className="text-sm text-tx-dim mt-1">
            Consulte alunos, acompanhe matrículas e faça novos cadastros.
          </p>
        </div>
        <Button onClick={openForm}>Novo cadastro</Button>
      </div>

      <div className={`flex gap-6 ${showForm ? 'items-start' : ''}`}>
        {/* Lista */}
        <div className="flex-1 min-w-0">
          {/* Filtros */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
              <Input placeholder="Nome ou nº de matrícula" className="pl-9" />
            </div>
            <Select className="w-40">
              <option>Todas as unidades</option>
              <option>Muscle Power</option>
              <option>Muscle Evolution</option>
            </Select>
            <Button variant="secondary">Pesquisar</Button>
          </div>

          {/* Tabela */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-tx-primary">Alunos cadastrados</span>
            <span className="text-xs text-tx-muted">5 resultados</span>
          </div>
          <Table>
            <Thead>
              <Tr>
                <Th>Aluno / matrícula</Th>
                <Th>Unidade</Th>
                <Th>Plano</Th>
                <Th>Matrícula</Th>
                <Th>Ação</Th>
              </Tr>
            </Thead>
            <Tbody>
              {students.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <p className="font-medium text-tx-primary">{s.name}</p>
                    <p className="text-xs text-tx-muted">{s.id}</p>
                  </Td>
                  <Td>
                    <span className={`text-xs font-medium ${s.unit === 'Muscle Evolution' ? 'text-evolution' : 'text-power'}`}>
                      {s.unit}
                    </span>
                  </Td>
                  <Td>
                    <p className="text-tx-primary">{s.plan}</p>
                    <p className="text-xs text-tx-muted">{s.value}</p>
                  </Td>
                  <Td>
                    <Badge variant={s.status === 'Ativa' ? 'success' : 'neutral'}>
                      {s.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Button size="sm" variant="ghost">Ver / editar</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-tx-muted">1–5 de 5 alunos</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled>Anterior</Button>
              <span className="px-3 py-1.5 text-xs bg-evolution-muted text-evolution border border-evolution-border rounded">1</span>
              <Button size="sm" variant="secondary">Próxima</Button>
            </div>
          </div>
        </div>

        {/* Formulário lateral */}
        {showForm && (
          <div className="w-80 min-w-[300px] bg-card border border-border rounded-lg p-6 self-start">
            <h2 className="text-base font-semibold text-tx-primary mb-1">Cadastrar aluno</h2>
            <p className="text-xs text-tx-muted mb-5">Dados do aluno e da matrícula.</p>

            <div className="flex flex-col gap-4">
              <InputField label="Nome completo">
                <Input placeholder="Nome completo" />
              </InputField>
              <InputField label="E-mail">
                <Input type="email" placeholder="nome@email.com" />
              </InputField>
              <InputField label="Telefone">
                <Input type="tel" placeholder="(00) 00000-0000" />
              </InputField>
              <InputField label="CPF">
                <Input placeholder="000.000.000-00" />
              </InputField>
              <InputField label="Unidade de origem">
                <Select value={formUnit} onChange={(e) => setFormUnit(e.target.value)}>
                  <option value="">Selecione a unidade</option>
                  <option value="power">Muscle Power</option>
                  <option value="evolution">Muscle Evolution</option>
                </Select>
              </InputField>
              <InputField label="Plano">
                <Select disabled={!formUnit}>
                  <option value="">
                    {formUnit ? 'Selecione o plano' : 'Selecione a unidade primeiro'}
                  </option>
                  {formUnit && plansByUnit[formUnit].map((plan) => (
                    <option key={plan}>{plan}</option>
                  ))}
                </Select>
              </InputField>
              <InputField label="Início da matrícula">
                <Input type="date" />
              </InputField>

              <p className="text-xs text-tx-muted">
                As mensalidades serão geradas automaticamente com base no plano e na data de início.
              </p>

              <div className="flex gap-2 pt-1">
                <Button variant="secondary" className="flex-1" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button className="flex-1">Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
