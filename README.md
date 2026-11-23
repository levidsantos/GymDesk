# GymDesk

Sistema web acadêmico de gerenciamento das academias **Muscle Power** e **Muscle Evolution**.

Projeto desenvolvido como protótipo funcional, com foco em simplicidade, organização e facilidade de manutenção. Permite gerenciar alunos, matrículas, mensalidades, pagamentos e regras de acesso por meio de uma interface administrativa e um portal do aluno.

---

## Funcionalidades

**Área administrativa:**
- Dashboard com indicadores gerais (alunos ativos, matrículas, pagamentos, atrasos).
- Cadastro, edição, inativação e reativação de alunos.
- Criação e inativação de matrículas com geração automática de mensalidades.
- Consulta de mensalidades com filtros e registro manual de pagamentos.
- Verificação de acesso por aluno e unidade com simulação de data/horário.
- Criação de contas de acesso para alunos.

**Portal do aluno:**
- Visão geral da matrícula, situação financeira e status de acesso.
- Consulta de mensalidades e histórico de pagamentos.
- Regras de acesso às unidades.

**Autenticação e segurança:**
- Login com sessões HTTP-only.
- Perfis de administrador e aluno com controle de acesso no backend.
- Troca de senha obrigatória no primeiro acesso.
- Senhas armazenadas com hash bcrypt.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| Estilização | Tailwind CSS |
| Backend | Node.js + Express |
| Banco de dados | SQLite via better-sqlite3 |
| Ícones | Lucide React |

---

## Estrutura do projeto

```
gymdesk/
├── client/                  # Frontend React + Vite
│   └── src/
│       ├── components/      # Componentes reutilizáveis (Button, Table, Alert, etc.)
│       ├── demo/            # Módulo do modo demonstrativo (mock API + dados)
│       ├── lib/             # Utilitários compartilhados (apiFetch centralizado)
│       ├── pages/
│       │   ├── admin/       # Dashboard, Students, Payments, Rules
│       │   └── student/     # Home, Finance, Rules
│       ├── App.jsx          # Roteamento e controle de sessão
│       ├── Login.jsx        # Tela de login
│       └── ChangePassword.jsx
├── server/                  # Backend Node.js + Express
│   └── src/
│       ├── database/        # Conexão SQLite, schema, seeds
│       ├── middleware/       # Autenticação e autorização
│       └── routes/          # Endpoints da API REST
├── database/                # Arquivo SQLite (não versionado)
├── docs/                    # Documentação complementar
└── package.json
```

---

## Instalação e execução local

### Pré-requisitos

- Node.js 18 ou superior.
- npm.

### Instalar dependências

```bash
npm run install:all
```

### Configurar o backend

```bash
cp server/.env.example server/.env
```

O arquivo `.env` contém:

```
PORT=3001
DB_PATH=database/gymdesk.db
NODE_ENV=development
```

O banco de dados SQLite é criado automaticamente na primeira execução, com o schema, as unidades, os planos e a conta de administrador.

### Executar em desenvolvimento

```bash
npm run dev
```

Inicia o frontend em `http://localhost:5173` e o backend em `http://localhost:3001`.

Se as portas estiverem ocupadas por processos anteriores:

```bash
npm run dev:clean
```

### Inserir dados de demonstração

Para popular o banco com alunos fictícios:

```bash
node server/src/database/seed-demo.js
```

Esse script limpa os dados de alunos existentes e insere 6 alunos com cenários variados. Veja a seção [Contas de demonstração](#contas-de-demonstração) para as credenciais.

---

## Modo demonstrativo (frontend-only)

O GymDesk possui um modo demonstrativo que funciona inteiramente no navegador, sem depender do backend ou do banco de dados. Nesse modo, todos os dados são mantidos em memória e as chamadas à API são simuladas por um módulo de mock.

### Executar localmente

```bash
cd client
VITE_DEMO=true npx vite
```

### Gerar build para publicação

```bash
cd client
VITE_DEMO=true npx vite build
```

O resultado em `client/dist/` pode ser publicado em qualquer serviço de hospedagem de sites estáticos (Vercel, Netlify, etc.). O arquivo `client/vercel.json` já contém a configuração de SPA para Vercel.

Para mais detalhes, consulte [docs/modo-demonstracao.md](docs/modo-demonstracao.md).

---

## Contas de demonstração

Disponíveis tanto no modo local (após executar o `seed-demo.js`) quanto no modo demonstrativo (`VITE_DEMO=true`).

| Perfil | E-mail | Senha | Cenário |
|---|---|---|---|
| Administrador | admin@email.com | admin123 | Acesso completo |
| Aluno | lucas.ferreira@email.com | senha123 | Power Semestral, ativo, em dia |
| Aluno | beatriz.oliveira@email.com | senha123 | Evolution Anual, ativa, em dia |
| Aluno | rafael.mendes@email.com | senha123 | Power Mensal, ativo, mensalidade em aberto |
| Aluno | juliana.costa@email.com | senha123 | Evolution Trimestral, ativa, em dia |
| Aluno | thiago.almeida@email.com | senha123 | Power Anual, inativo, histórico preservado |
| Aluno | mariana.lopes@email.com | senha123 | Sem matrícula, primeiro acesso (troca de senha obrigatória) |

---

## Unidades

**Muscle Power** — Planos: mensal (R$ 60), semestral (R$ 55/mês) e anual (R$ 50/mês).

**Muscle Evolution** — Planos: mensal (R$ 100), trimestral (R$ 95/mês), semestral (R$ 90/mês) e anual (R$ 85/mês).

---

## Documentação complementar

- [Guia de uso](docs/guia-de-uso.md) — Como utilizar as funcionalidades do sistema.
- [Regras de negócio](docs/regras-de-negocio.md) — Planos, matrículas, mensalidades e regras de acesso.
- [Modo demonstrativo](docs/modo-demonstracao.md) — Configuração e funcionamento do modo frontend-only.

---

## Limitações do protótipo

- Não há pagamentos online nem integração bancária.
- Não há envio automático de e-mails ou notificações.
- Não há integração com catracas ou equipamentos físicos.
- Não há gerenciamento de treinos.
- Não há aplicativo mobile dedicado.
- A recuperação de senha é feita presencialmente na recepção.
- Os planos são predefinidos e não podem ser alterados pela interface.
- Não existem juros ou multas por atraso.
