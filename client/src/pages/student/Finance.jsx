import Badge from '../../components/Badge'
import StatCard from '../../components/StatCard'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'
import { Select } from '../../components/Input'

// Lucas Ferreira · Muscle Power · Plano Semestral · R$ 55/mês · desde 20/06/2026
// Vencimento todo dia 20. Nov/2026 pago em 19/11. Dez/2026 em aberto (vence 20/12).
const payments = [
  { month: 'Dez/2026', due: '20/12/2026', value: 'R$ 55,00', status: 'Em aberto', paidAt: null         },
  { month: 'Nov/2026', due: '20/11/2026', value: 'R$ 55,00', status: 'Pago',      paidAt: '19/11/2026' },
  { month: 'Out/2026', due: '20/10/2026', value: 'R$ 55,00', status: 'Pago',      paidAt: '18/10/2026' },
  { month: 'Set/2026', due: '20/09/2026', value: 'R$ 55,00', status: 'Pago',      paidAt: '20/09/2026' },
  { month: 'Ago/2026', due: '20/08/2026', value: 'R$ 55,00', status: 'Pago',      paidAt: '19/08/2026' },
  { month: 'Jul/2026', due: '20/07/2026', value: 'R$ 55,00', status: 'Pago',      paidAt: '20/07/2026' },
]

const history = [
  { paidAt: '19/11/2026', month: 'Nov/2026', value: 'R$ 55,00', method: 'Pix'                },
  { paidAt: '18/10/2026', month: 'Out/2026', value: 'R$ 55,00', method: 'Dinheiro'           },
  { paidAt: '20/09/2026', month: 'Set/2026', value: 'R$ 55,00', method: 'Cartão na recepção' },
  { paidAt: '19/08/2026', month: 'Ago/2026', value: 'R$ 55,00', method: 'Dinheiro'           },
  { paidAt: '20/07/2026', month: 'Jul/2026', value: 'R$ 55,00', method: 'Pix'                },
]

export default function StudentFinance() {
  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-tx-primary">Situação financeira</h1>
        <p className="text-sm text-tx-dim mt-1">
          Lucas Ferreira · Matrícula GD-0043 · Plano Semestral
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7 mt-6">
        <StatCard
          label="Em aberto"
          value="R$ 55,00"
          sub="1 mensalidade · Dezembro de 2026"
        />
        <StatCard
          label="Próximo vencimento"
          value="20/12/2026"
          sub="Mensalidade de R$ 55,00"
        />
        <StatCard
          label="Em atraso"
          value="R$ 0,00"
          sub="Nenhuma mensalidade vencida"
        />
      </div>

      {/* Tabela de mensalidades */}
      <div className="bg-card border border-border rounded-lg mb-5">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-tx-primary">Minhas mensalidades</h2>
          <div className="flex gap-2">
            <Select className="w-28 text-xs">
              <option>2026</option>
            </Select>
            <Select className="w-32 text-xs">
              <option>Todas</option>
              <option>Em aberto</option>
              <option>Pago</option>
              <option>Em atraso</option>
            </Select>
          </div>
        </div>

        <Table>
          <Thead>
            <Tr>
              <Th>Competência</Th>
              <Th>Vencimento</Th>
              <Th>Valor</Th>
              <Th>Situação</Th>
              <Th>Data do pagamento</Th>
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
                    p.status === 'Pago'      ? 'success' :
                    p.status === 'Em atraso' ? 'danger'  : 'warning'
                  }>
                    {p.status}
                  </Badge>
                </Td>
                <Td className="text-tx-dim font-medium">
                  {p.paidAt ?? '—'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <div className="px-6 py-3 border-t border-border">
          <p className="text-xs text-tx-muted">
            6 mensalidades encontradas · referência: 21/11/2026. Uma mensalidade em aberto não está necessariamente em atraso.
          </p>
        </div>
      </div>

      {/* Histórico de pagamentos */}
      <div className="bg-card border border-border rounded-lg mb-5">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-tx-primary">Histórico de pagamentos</h2>
        </div>
        <Table>
          <Thead>
            <Tr>
              <Th>Recebido em</Th>
              <Th>Competência</Th>
              <Th>Valor recebido</Th>
              <Th>Forma de recebimento</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.map((h, i) => (
              <Tr key={i}>
                <Td className="text-tx-dim">{h.paidAt}</Td>
                <Td>{h.month}</Td>
                <Td>{h.value}</Td>
                <Td className="font-medium">{h.method}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
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
