import Badge from '../../components/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/Table'

export default function StudentRules() {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-tx-muted uppercase tracking-wide mb-1">Plano contratado</p>
            <p className="font-semibold text-tx-primary">Semestral · R$ 55,00/mês</p>
          </div>
          <div>
            <p className="text-xs text-tx-muted uppercase tracking-wide mb-1">Matrícula</p>
            <Badge variant="success">Ativa</Badge>
          </div>
          <div>
            <p className="text-xs text-tx-muted uppercase tracking-wide mb-1">Mensalidades vencidas</p>
            <p className="font-semibold text-success">Nenhuma</p>
          </div>
        </div>
        <p className="text-xs text-tx-muted mt-4">
          A próxima mensalidade vence em 20/12/2026 e não impede o acesso antes do vencimento.
        </p>
      </div>

      {/* Cards das unidades */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Muscle Power */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-power">Muscle Power</h2>
            <Badge variant="success">Acesso permitido</Badge>
          </div>
          <p className="text-sm text-tx-dim mb-4">Sua unidade de origem.</p>
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
            <Badge variant="warning">Somente aos domingos</Badge>
          </div>
          <p className="text-sm text-tx-dim mb-4">
            Alunos da Muscle Power podem utilizar a Muscle Evolution somente aos domingos,
            durante o horário de funcionamento.
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
