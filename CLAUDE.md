# GymDesk — Instruções do projeto

## 1. Objetivo

GymDesk é um sistema web acadêmico de gerenciamento de duas unidades de academia: Muscle Power e Muscle Evolution.

O objetivo é desenvolver um protótipo funcional para gerenciamento de alunos, matrículas, mensalidades, pagamentos e regras de acesso.

Priorize simplicidade, organização, clareza e facilidade de manutenção. Não transforme o projeto em uma solução comercial complexa.

## 2. Tecnologias

- Frontend: React + Vite.
- Estilização: Tailwind CSS.
- Backend: Node.js + Express.
- Banco de dados: SQLite.
- Acesso ao SQLite: better-sqlite3.
- Ícones: Lucide.
- Controle de versão: Git.

O frontend deve acessar o banco exclusivamente por meio da API do backend.

Preserve as configurações existentes sempre que possível.

## 3. Unidades e identidade visual

**Muscle Power**
- Identificação visual atual: vermelho.
- Planos: mensal, semestral e anual.

**Muscle Evolution**
- Identificação visual atual: amarelo.
- Planos: mensal, trimestral, semestral e anual.

Utilize preferencialmente uma interface escura, com fundo preto e tons de cinza.

Evite o uso excessivo de vermelho. Reserve-o preferencialmente para erros, atrasos e alertas importantes. O amarelo pode ser utilizado como destaque visual, sem confundir a identidade administrativa com uma unidade específica.

## 4. Regras de negócio

### Planos e preços

Valores mensais conforme a duração contratada:

| Unidade | Plano | Duração | Valor mensal |
|---|---|---:|---:|
| Muscle Power | Mensal | 1 mês | R$ 60 |
| Muscle Power | Semestral | 6 meses | R$ 55 |
| Muscle Power | Anual | 12 meses | R$ 50 |
| Muscle Evolution | Mensal | 1 mês | R$ 100 |
| Muscle Evolution | Trimestral | 3 meses | R$ 95 |
| Muscle Evolution | Semestral | 6 meses | R$ 90 |
| Muscle Evolution | Anual | 12 meses | R$ 85 |

Os planos são predefinidos. Não é necessário implementar gerenciamento de planos.

### Matrículas

- Cada aluno pode possuir apenas uma matrícula ativa por vez.
- Uma matrícula pode ser inativada pelo administrador.
- O histórico financeiro deve ser preservado após a inativação.
- Não devem ser geradas novas mensalidades após o encerramento da matrícula.
- O aluno pode possuir uma conta mesmo sem matrícula ativa.

### Mensalidades e pagamentos

- O vencimento corresponde ao dia de início da matrícula.
- Se o dia não existir em determinado mês, utilizar o último dia daquele mês.
- As mensalidades do período contratado são geradas na criação da matrícula.
- Não existem juros ou multas por atraso.
- Os pagamentos são registrados manualmente pelo administrador.
- O histórico de pagamentos deve ser preservado.
- A competência identifica o mês de referência da mensalidade.

### Regras de acesso

**Muscle Power:**
- Acesso à própria unidade durante seu funcionamento.
- Acesso à Muscle Evolution somente aos domingos, das 08h às 12h.

**Muscle Evolution:**
- Acesso às duas unidades durante seus respectivos horários de funcionamento.

Horários:

| Dia | Muscle Power | Muscle Evolution |
|---|---|---|
| Segunda a sexta | 05h–21h | 05h–21h |
| Sábado | 08h–12h | 07h–13h |
| Domingo | Fechado | 08h–12h |

O acesso exige matrícula ativa e ausência de mensalidades vencidas.

Não existe integração com catracas ou equipamentos físicos.

## 5. Contas e autenticação

- Existem dois perfis: administrador e aluno.
- O e-mail é o identificador de login e deve ser único.
- O administrador pode criar contas de alunos independentemente da matrícula.
- A senha provisória é fornecida manualmente pelo administrador.
- O primeiro acesso exige alteração da senha.
- A recuperação de senha orienta o aluno a procurar a administração.
- Utilize hash seguro para armazenar senhas.
- A autorização deve ser validada no backend, não apenas na interface.

## 6. Escopo do projeto

Funcionalidades previstas:

- Login de administrador e aluno.
- Dashboard administrativo.
- Cadastro e gerenciamento de alunos.
- Gerenciamento de matrículas.
- Gerenciamento de mensalidades.
- Registro manual de pagamentos.
- Histórico financeiro.
- Consulta das regras de acesso.
- Portal do aluno.

Fora do escopo:

- Pagamentos online.
- Integração bancária.
- Envio automático de e-mails.
- Integração com catracas.
- Gerenciamento de treinos.
- Aplicativo mobile dedicado.

Evite adicionar funcionalidades que não foram solicitadas.

## 7. Estado atual do desenvolvimento

- Etapa 1: estrutura inicial do projeto, frontend, backend e conexão SQLite — concluída.
- Etapa 2: identidade visual, componentes reutilizáveis, layouts e páginas — concluída.
- Etapa 3: banco de dados, backend e funcionalidades principais — concluída.
  - Schema SQLite (8 tabelas), seeds de unidades, planos e admin.
  - CRUD de alunos, matrículas, mensalidades, pagamentos e regras de acesso.
  - Autenticação com sessões HTTP-only, middleware por perfil, troca de senha obrigatória.
  - Portal do aluno e dashboard administrativo conectados a dados reais.
  - Inativação de aluno inativa automaticamente a matrícula ativa.
  - Matrículas expiradas são encerradas automaticamente nas consultas.
- Próxima etapa: refinamentos de interface e validação integrada.

## 8. Orientações para alterações

- Antes de modificar arquivos, analise a implementação existente.
- Preserve funcionalidades e configurações que já estejam funcionando.
- Evite reescrever componentes sem necessidade.
- Reutilize componentes e padrões existentes.
- Não instale dependências sem justificativa.
- Não implemente regras de negócio por suposição.
- Em caso de dúvida ou conflito entre código e requisitos, apresente a questão antes de tomar decisões importantes.
- Diferencie problemas reais de melhorias opcionais.
- Sempre que possível, execute testes e verifique o funcionamento após alterações.
- Informe quais arquivos foram criados ou modificados e explique decisões técnicas relevantes.