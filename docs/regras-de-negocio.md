# Regras de negócio

Este documento descreve as regras de negócio implementadas no GymDesk.

---

## Unidades

O sistema gerencia duas unidades de academia:

- **Muscle Power**
- **Muscle Evolution**

Cada unidade possui seus próprios planos, preços e horários de funcionamento.

---

## Planos e valores

Os planos são predefinidos e não podem ser alterados pela interface. O valor mensal varia conforme a duração contratada:

| Unidade | Plano | Duração | Valor mensal |
|---|---|---:|---:|
| Muscle Power | Mensal | 1 mês | R$ 60,00 |
| Muscle Power | Semestral | 6 meses | R$ 55,00 |
| Muscle Power | Anual | 12 meses | R$ 50,00 |
| Muscle Evolution | Mensal | 1 mês | R$ 100,00 |
| Muscle Evolution | Trimestral | 3 meses | R$ 95,00 |
| Muscle Evolution | Semestral | 6 meses | R$ 90,00 |
| Muscle Evolution | Anual | 12 meses | R$ 85,00 |

---

## Matrículas

- Cada aluno pode possuir apenas uma matrícula ativa por vez.
- A matrícula pode ser inativada pelo administrador a qualquer momento.
- O aluno pode existir no sistema sem matrícula ativa.
- Matrículas cujo período já expirou (data final anterior à data atual) são encerradas automaticamente nas consultas.
- A inativação da matrícula cancela as mensalidades futuras pendentes, mas preserva o histórico financeiro (mensalidades já pagas ou vencidas).
- Não é possível criar matrícula para um aluno inativo.

---

## Mensalidades

- As mensalidades do período contratado são geradas automaticamente na criação da matrícula.
- O vencimento corresponde ao dia de início da matrícula em cada mês subsequente.
- Se o dia de vencimento não existir em determinado mês (ex.: dia 31 em meses com 30 dias), utiliza-se o último dia daquele mês.
- Cada mensalidade possui uma competência (mês de referência) e uma data de vencimento.
- Os status possíveis são: pendente, pago e cancelado.
- Uma mensalidade pendente com vencimento anterior à data atual é considerada "em atraso" (status virtual calculado em tempo de consulta).
- Novas mensalidades não são geradas após o encerramento da matrícula.

---

## Pagamentos

- Os pagamentos são registrados manualmente pelo administrador.
- Cada mensalidade pode ter no máximo um pagamento associado.
- O registro inclui: data do pagamento, valor recebido e observação opcional.
- Não existem juros ou multas por atraso.
- Não é possível registrar pagamento de mensalidade já paga ou cancelada.
- O histórico de pagamentos é preservado mesmo após a inativação do aluno ou da matrícula.

---

## Inativação e reativação de alunos

**Inativação:**
- Ao inativar um aluno, a matrícula ativa (se houver) é inativada automaticamente.
- As mensalidades futuras pendentes da matrícula são canceladas.
- Mensalidades já vencidas ou pagas são preservadas.

**Reativação:**
- Restaura o status do aluno para ativo.
- A matrícula anteriormente inativada não é reativada. Uma nova matrícula deve ser criada.

---

## Regras de acesso às unidades

### Horários de funcionamento

| Dia | Muscle Power | Muscle Evolution |
|---|---|---|
| Segunda a sexta | 05h às 21h | 05h às 21h |
| Sábado | 08h às 12h | 07h às 13h |
| Domingo | Fechada | 08h às 12h |

### Permissão de acesso entre unidades

| Unidade de origem | Muscle Power | Muscle Evolution |
|---|---|---|
| Muscle Power | Permitido | Somente aos domingos (08h às 12h) |
| Muscle Evolution | Permitido | Permitido |

As regras são iguais para todos os planos, independentemente da duração.

### Condições obrigatórias para acesso

O acesso a qualquer unidade exige que todas as condições sejam atendidas simultaneamente:

1. **Aluno ativo** — o cadastro do aluno não pode estar inativo.
2. **Matrícula ativa** — o aluno deve possuir uma matrícula ativa.
3. **Sem mensalidades vencidas** — não pode haver mensalidades com vencimento anterior à data atual e status pendente. Mensalidades em aberto cujo vencimento ainda não passou não impedem o acesso.
4. **Unidade em funcionamento** — a unidade pretendida deve estar dentro do horário de funcionamento.
5. **Permissão entre unidades** — a combinação de unidade de origem (plano) e unidade pretendida deve ser permitida.

---

## Contas e autenticação

- Existem dois perfis: administrador e aluno.
- O e-mail é o identificador de login e deve ser único.
- O administrador cria as contas de alunos manualmente, definindo uma senha provisória.
- O primeiro acesso do aluno exige a alteração da senha.
- A recuperação de senha orienta o aluno a procurar a administração presencialmente.
- As senhas são armazenadas com hash bcrypt.
- As sessões utilizam tokens HTTP-only com validade de 7 dias.
- A autorização é validada no backend por middleware, não apenas na interface.
