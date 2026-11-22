import StatCard from '../../components/StatCard'
import Badge from '../../components/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'
import Button from '../../components/Button'

// Referência: 21/11/2026
// Mensalidades em atraso: Carlos Mendes (nov/venc 05/11) e Rafael Torres (nov/venc 15/11)
const pendingPayments = [
  {
    name: 'Carlos Mendes',
    unit: 'Muscle Power',
    month: 'Nov/2026',
    due: '05/11/2026',
    value: 'R$ 50,00',
    status: 'Em atraso',
  },
  {
    name: 'Rafael Torres',
    unit: 'Muscle Power',
    month: 'Nov/2026',
    due: '15/11/2026',
    value: 'R$ 60,00',
    status: 'Em atraso',
  },
  {
    name: 'Beatriz Souza',
    unit: 'Muscle Evolution',
    month: 'Dez/2026',
    due: '10/12/2026',
    value: 'R$ 90,00',
    status: 'Em aberto',
  },
]

export default function Dashboard() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-tx-primary">Painel administrativo</h1>
        <p className="text-sm text-tx-dim mt-1">
          Visão geral dos alunos e das mensalidades das duas unidades.
        </p>
      </div>

      {/* Indicadores — coerentes com os 5 alunos demonstrativos */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Alunos cadastrados"
          value="5"
          sub="Muscle Power: 3 · Muscle Evolution: 2"
        />
        <StatCard
          label="Matrículas ativas"
          value="4"
          sub="1 matrícula inativa"
        />
        <StatCard
          label="Recebido em nov/2026"
          value="R$ 235,00"
          sub="3 mensalidades registradas"
        />
        <StatCard
          label="Mensalidades em atraso"
          value="2"
          sub="Total pendente: R$ 110,00"
        />
      </div>

      {/* Atalhos */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-medium text-tx-dim">Atalhos</span>
        <div className="flex gap-2 ml-2">
          <Button size="sm" variant="secondary">Cadastrar aluno</Button>
          <Button size="sm">Registrar pagamento</Button>
        </div>
      </div>

      {/* Mensalidades pendentes */}
      <div className="bg-card border border-border rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-tx-primary">
            Mensalidades que precisam de atenção
          </h2>
        </div>
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
            {pendingPayments.map((row, i) => (
              <Tr key={i}>
                <Td>{row.name}</Td>
                <Td>
                  <span className={`text-xs font-medium ${
                    row.unit === 'Muscle Evolution' ? 'text-evolution' : 'text-power'
                  }`}>
                    {row.unit}
                  </span>
                </Td>
                <Td className="text-tx-dim">{row.month}</Td>
                <Td className="text-tx-dim">{row.due}</Td>
                <Td>{row.value}</Td>
                <Td>
                  <Badge variant={row.status === 'Em atraso' ? 'danger' : 'warning'}>
                    {row.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <div className="px-6 py-3 flex items-center justify-between border-t border-border">
          <span className="text-xs text-tx-muted">
            Exibindo 3 mensalidades · referência: 21/11/2026
          </span>
          <Button size="sm" variant="secondary">Ver mensalidades</Button>
        </div>
      </div>

      {/* Alunos por unidade + Regras */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-tx-primary mb-4">Alunos por unidade</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-power font-medium">Muscle Power</span>
              <span className="text-sm text-tx-primary font-semibold">
                3 alunos · 3 ativos
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-evolution font-medium">Muscle Evolution</span>
              <span className="text-sm text-tx-primary font-semibold">
                2 alunos · 1 ativo · 1 inativo
              </span>
            </div>
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
