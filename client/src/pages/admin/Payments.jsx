import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input, InputField, Select } from '../../components/Input'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'

// Carlos Mendes — Muscle Power · Plano Anual R$50/mês · desde 05/03/2026 · vencimento todo dia 5
// Nov/2026 venceu em 05/11 e ainda não foi pago → Em atraso
const studentData = {
  name: 'Carlos Mendes',
  enrollment: 'GD-0017 · Ativa',
  plan: 'Anual · Muscle Power · R$ 50,00/mês',
}

const payments = [
  { month: 'Nov/2026', due: '05/11/2026', value: 'R$ 50,00', status: 'Em atraso', paidAt: null         },
  { month: 'Out/2026', due: '05/10/2026', value: 'R$ 50,00', status: 'Pago',      paidAt: '03/10/2026' },
  { month: 'Set/2026', due: '05/09/2026', value: 'R$ 50,00', status: 'Pago',      paidAt: '05/09/2026' },
  { month: 'Ago/2026', due: '05/08/2026', value: 'R$ 50,00', status: 'Pago',      paidAt: '04/08/2026' },
]

export default function Payments() {
  const [registered, setRegistered] = useState(false)
  const [selected, setSelected]     = useState(null)

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-tx-primary">Mensalidades</h1>
        <p className="text-sm text-tx-dim mt-1">
          Consulte vencimentos e registre pagamentos recebidos pela academia.
        </p>
      </div>

      {registered && (
        <Alert variant="success" title="Pagamento registrado com sucesso" className="mb-6">
          A mensalidade de novembro de Carlos Mendes foi atualizada para Pago.
        </Alert>
      )}

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
          <Input placeholder="Pesquisar aluno" className="pl-9" defaultValue="Carlos Mendes" />
        </div>
        <Select className="w-40">
          <option>Todas as situações</option>
          <option>Em aberto</option>
          <option>Em atraso</option>
          <option>Pago</option>
        </Select>
        <Select className="w-40">
          <option>Todas as competências</option>
          <option>Nov/2026</option>
          <option>Out/2026</option>
        </Select>
        <Button variant="secondary">Pesquisar</Button>
      </div>

      <div className="flex gap-6 items-start">
        {/* Lista */}
        <div className="flex-1 min-w-0">
          {/* Info do aluno */}
          <div className="bg-card border border-border rounded-lg p-5 mb-4">
            <p className="text-base font-semibold text-tx-primary mb-3">{studentData.name}</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-tx-muted">Matrícula</span>
              <span className="text-tx-primary font-medium">{studentData.enrollment}</span>
              <span className="text-tx-muted">Plano e origem</span>
              <span className="text-tx-primary font-medium">{studentData.plan}</span>
            </div>
          </div>

          <Table>
            <Thead>
              <Tr>
                <Th>Competência</Th>
                <Th>Vencimento</Th>
                <Th>Valor</Th>
                <Th>Situação</Th>
                <Th>Pagamento</Th>
                <Th>Ação</Th>
              </Tr>
            </Thead>
            <Tbody>
              {payments.map((p, i) => (
                <Tr key={i}>
                  <Td>{p.month}</Td>
                  <Td className="text-tx-dim">{p.due}</Td>
                  <Td>{p.value}</Td>
                  <Td>
                    <Badge variant={
                      p.status === 'Pago' ? 'success' :
                      p.status === 'Em atraso' ? 'danger' : 'warning'
                    }>
                      {p.status}
                    </Badge>
                  </Td>
                  <Td className="text-tx-dim">{p.paidAt ?? '—'}</Td>
                  <Td>
                    {p.status !== 'Pago' ? (
                      <Button size="sm" onClick={() => setSelected(p)}>Registrar</Button>
                    ) : (
                      <Button size="sm" variant="ghost">Ver registro</Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <p className="text-xs text-tx-muted mt-3">
            4 mensalidades · Em atraso: R$ 50,00 · Pagas: R$ 150,00
          </p>

          {/* Histórico */}
          <div className="bg-card border border-border rounded-lg p-5 mt-5">
            <h2 className="text-sm font-semibold text-tx-primary mb-3">Histórico de pagamentos</h2>
            <div className="space-y-2 text-sm text-tx-dim">
              <p>Out/2026 · Recebido em 03/10/2026 · R$ 50,00 · Dinheiro</p>
              <p>Set/2026 · Recebido em 05/09/2026 · R$ 50,00 · Pix</p>
              <p>Ago/2026 · Recebido em 04/08/2026 · R$ 50,00 · Dinheiro</p>
            </div>
          </div>
        </div>

        {/* Painel de registro */}
        <div className="w-72 min-w-[260px] bg-card border border-border rounded-lg p-6 self-start">
          {!registered && selected ? (
            <>
              <h2 className="text-base font-semibold text-tx-primary mb-1">Registrar pagamento</h2>
              <Badge variant="warning" className="mb-4">Mensalidade selecionada · Em aberto</Badge>
              <p className="text-xs text-tx-dim mb-5">
                {studentData.name} · {selected.month}<br/>
                Vencimento em {selected.due}
              </p>

              <div className="flex flex-col gap-4">
                <InputField label="Valor recebido">
                  <Input defaultValue={selected.value} />
                </InputField>
                <InputField label="Data do pagamento">
                  <Input type="date" defaultValue="2026-11-21" />
                </InputField>
                <InputField label="Forma de recebimento">
                  <Select>
                    <option>Dinheiro</option>
                    <option>Cartão na recepção</option>
                    <option>Pix</option>
                    <option>Outro</option>
                  </Select>
                </InputField>
                <InputField label="Observação (opcional)">
                  <Input placeholder="Recebido na recepção" />
                </InputField>
                <p className="text-xs text-tx-muted">
                  Registro administrativo de um valor já recebido. Nenhum pagamento online é realizado.
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>Cancelar</Button>
                  <Button className="flex-1" onClick={() => { setRegistered(true); setSelected(null) }}>Registrar</Button>
                </div>
              </div>
            </>
          ) : registered ? (
            <>
              <h2 className="text-base font-semibold text-tx-primary mb-3">Registro confirmado</h2>
              <Badge variant="success" className="mb-4">Pago</Badge>
              <p className="text-3xl font-bold text-tx-primary mb-1">R$ 50,00</p>
              <p className="text-xs text-tx-dim mb-4">Carlos Mendes · Mensalidade de novembro de 2026</p>
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-tx-muted">Recebido em</span>
                  <span className="font-medium">21/11/2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tx-muted">Forma</span>
                  <span className="font-medium">Dinheiro</span>
                </div>
              </div>
              <Button className="w-full mt-5" onClick={() => setRegistered(false)}>
                Voltar às mensalidades
              </Button>
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
