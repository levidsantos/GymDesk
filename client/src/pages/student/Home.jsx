import Badge from '../../components/Badge'
import Button from '../../components/Button'

// Aluno demonstrativo: Lucas Ferreira
// Muscle Power · Plano Semestral · R$ 55/mês · matrícula desde 20/06/2026
// Situação financeira: em dia — Nov/2026 pago, Dez/2026 em aberto (vence 20/12)
export default function StudentHome({ onNavigate }) {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-tx-primary">Olá, Lucas</h1>
        <p className="text-sm text-tx-dim mt-1">
          Acompanhe sua matrícula, mensalidades e o acesso às unidades.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Matrícula */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-tx-primary">Minha matrícula</h2>
            <Badge variant="success">Ativa</Badge>
          </div>
          <p className="text-lg font-semibold text-tx-primary mb-4">Lucas Ferreira</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-tx-muted">Número</span>
              <span className="text-tx-primary font-medium">GD-0043</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tx-muted">Plano</span>
              <span className="text-tx-primary font-medium">Semestral · R$ 55,00/mês</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tx-muted">Unidade de origem</span>
              <span className="text-power font-medium">Muscle Power</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tx-muted">Início da matrícula</span>
              <span className="text-tx-primary">20/06/2026</span>
            </div>
          </div>
        </div>

        {/* Próxima mensalidade */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-base font-semibold text-tx-primary mb-4">Próxima mensalidade</h2>
          <Badge variant="warning" className="mb-3">Em aberto · Ainda não vencida</Badge>
          <p className="text-3xl font-bold text-tx-primary mt-2 mb-1">R$ 55,00</p>
          <p className="text-sm text-tx-dim mb-1">Dezembro de 2026 · Vencimento em 20/12/2026</p>
          <p className="text-xs text-success mb-5">Você não possui mensalidades em atraso.</p>
          <Button variant="secondary" size="sm" onClick={() => onNavigate('finance')}>
            Ver situação financeira
          </Button>
        </div>
      </div>

      {/* Resumo de acesso */}
      <div className="bg-evolution-muted border border-evolution-border rounded-lg p-5 mb-5">
        <p className="text-sm font-semibold text-evolution mb-1">
          Acesso à Muscle Evolution permitido aos domingos
        </p>
        <p className="text-sm text-tx-dim">
          Seu plano Muscle Power inclui acesso à Muscle Evolution somente aos domingos, das 08h às 12h.
          Sua matrícula está ativa e não há mensalidades vencidas.
        </p>
      </div>

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
