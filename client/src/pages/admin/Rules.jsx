import Button from '../../components/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'

const accessRules = [
  { plan: 'Qualquer plano',  origin: 'Muscle Power',    power: 'Permitido',      evolution: 'Domingos apenas' },
  { plan: 'Qualquer plano',  origin: 'Muscle Evolution', power: 'Permitido',      evolution: 'Permitido'       },
]

export default function Rules() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-tx-primary">Regras de acesso</h1>
        <p className="text-sm text-tx-dim mt-1">
          Condições de utilização das unidades Muscle Power e Muscle Evolution.
        </p>
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
                <Td>
                  <span className="text-success text-sm">{r.power}</span>
                </Td>
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
