# Guia de uso

Este guia descreve como utilizar as funcionalidades do GymDesk após o sistema estar em execução. Para instruções de instalação e configuração, consulte o [README](../README.md).

---

## Acesso ao sistema

1. Abra `http://localhost:5173` no navegador (modo local) ou o endereço publicado (modo demonstrativo).
2. Informe e-mail e senha.
3. O sistema identifica automaticamente se a conta é de administrador ou aluno e direciona para a área correspondente.

No primeiro acesso de um aluno cuja conta foi criada pelo administrador, o sistema solicita a alteração da senha antes de prosseguir.

As credenciais de demonstração estão listadas no [README](../README.md#contas-de-demonstração).

---

## Área administrativa

### Dashboard

Exibe um painel com indicadores gerais:
- Número de alunos ativos e matrículas ativas.
- Total recebido no mês corrente.
- Quantidade de mensalidades em atraso e valor total pendente.
- Lista das próximas mensalidades que precisam de atenção.
- Distribuição de matrículas por unidade.

### Gerenciamento de alunos

**Cadastrar aluno:**
1. Na página de Alunos, clique em "Novo aluno".
2. Preencha nome (obrigatório), e-mail, telefone e data de nascimento.
3. Confirme o cadastro.

O aluno é criado com status ativo e sem matrícula. A criação de conta de acesso é uma etapa separada.

**Editar aluno:**
1. Clique no aluno na lista.
2. Altere os campos desejados no painel lateral.
3. Salve as alterações.

Se o aluno tiver conta vinculada e o e-mail for alterado, a conta é atualizada automaticamente.

**Inativar aluno:**
1. No painel do aluno, clique em "Inativar aluno".
2. Confirme a operação.

A inativação do aluno inativa automaticamente a matrícula ativa (se houver) e cancela as mensalidades futuras pendentes. O histórico financeiro é preservado.

**Reativar aluno:**
1. Filtre a lista por alunos inativos.
2. Selecione o aluno e clique em "Reativar aluno".

A reativação restaura o status do aluno para ativo. A matrícula inativada não é reativada automaticamente — uma nova matrícula deve ser criada, se necessário.

**Criar conta de acesso:**
1. No painel do aluno (que tenha e-mail cadastrado e ainda não possua conta), clique em "Criar conta".
2. Defina uma senha provisória (mínimo 6 caracteres).

A conta é criada com a flag de troca de senha obrigatória no primeiro acesso.

### Gerenciamento de matrículas

**Criar matrícula:**
1. No painel de um aluno ativo que não tenha matrícula ativa, clique em "Nova matrícula".
2. Selecione a unidade (Muscle Power ou Muscle Evolution).
3. Selecione o plano disponível.
4. Informe a data de início.
5. Confirme.

As mensalidades do período contratado são geradas automaticamente, com vencimentos baseados no dia de início da matrícula.

**Inativar matrícula:**
1. No painel do aluno, clique em "Inativar matrícula" na matrícula ativa.
2. Confirme a operação.

As mensalidades futuras pendentes são canceladas. Mensalidades já vencidas (pagas ou não) são preservadas.

### Mensalidades e pagamentos

**Consultar mensalidades:**
- Na página de Mensalidades, utilize os filtros por nome do aluno e situação (todas, em aberto, em atraso, pagas, canceladas).
- O resumo exibe a contagem de cada situação no resultado filtrado.

**Registrar pagamento:**
1. Localize a mensalidade com status "Em aberto" ou "Em atraso".
2. Clique em "Registrar".
3. Informe o valor recebido, a data do pagamento e uma observação opcional.
4. Confirme o registro.

O pagamento é um registro administrativo de um valor já recebido. Não há cobrança online.

**Histórico de pagamentos:**
- Na parte inferior da página de Mensalidades, os últimos pagamentos registrados são exibidos.

### Verificação de acesso

Na página de Regras de acesso:
1. Pesquise o aluno pelo nome.
2. Selecione o aluno e a unidade pretendida.
3. Clique em "Verificar acesso".

O sistema exibe se o acesso é autorizado ou negado, com o motivo detalhado. A verificação considera: status do aluno, matrícula ativa, mensalidades vencidas, horário de funcionamento e permissão entre unidades.

---

## Portal do aluno

### Página inicial

Exibe um resumo com:
- Dados da matrícula ativa (plano, unidade, período).
- Situação financeira (mensalidades em atraso, próximo vencimento).
- Status de acesso atual às duas unidades.

### Situação financeira

Lista todas as mensalidades do aluno com suas situações (pago, em aberto, em atraso, cancelada) e o histórico de pagamentos registrados pela administração.

### Regras de acesso

Apresenta as condições de acesso do aluno às unidades, com base no plano contratado, horários de funcionamento e situação financeira. Inclui a tabela de horários e as regras de acesso entre unidades.

---

## Observações

- Para atualizar dados da matrícula ou informar um pagamento, o aluno deve procurar a recepção da unidade.
- A recuperação de senha é feita presencialmente na administração.
- Não há integração com catracas ou equipamentos físicos — as regras de acesso são informativas.
