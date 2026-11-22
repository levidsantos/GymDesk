# GymDesk

Sistema web acadêmico de gerenciamento das academias **Muscle Power** e **Muscle Evolution**.

Projeto acadêmico com foco em simplicidade, clareza e facilidade de manutenção.

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
├── client/          # Frontend React + Vite
│   └── src/
│       ├── components/   # Componentes reutilizáveis
│       ├── pages/
│       │   ├── admin/    # Painel administrativo
│       │   └── student/  # Portal do aluno
│       └── App.jsx
├── server/          # Backend Node.js + Express
│   └── src/
│       ├── database/     # Conexão com o SQLite
│       └── routes/
├── database/        # Arquivo SQLite (não versionado)
└── package.json     # Script para rodar os dois servidores
```

---

## Instalação

```bash
# Instalar todas as dependências (raiz, client e server)
npm run install:all
```

---

## Executar em desenvolvimento

```bash
npm run dev
```

Inicia o frontend em `http://localhost:5173` e o backend em `http://localhost:3001`.

### Configuração do backend

Copie o arquivo de exemplo e ajuste conforme necessário:

```bash
cp server/.env.example server/.env
```

O banco de dados SQLite é criado automaticamente em `database/gymdesk.db` na primeira execução.

---

## Acesso demonstrativo

A autenticação desta etapa é local e fictícia. As credenciais reais serão implementadas em etapa posterior.

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@email.com | admin123 |
| Aluno | aluno@email.com | aluno123 |

---

## Estado atual do desenvolvimento

| Etapa | Descrição | Situação |
|---|---|---|
| 1 | Estrutura inicial, frontend, backend e conexão SQLite | Concluída |
| 2 | Identidade visual, componentes reutilizáveis e páginas demonstrativas | Concluída |
| 3 | Banco de dados definitivo e funcionalidades reais | Próxima |

As páginas atuais utilizam dados demonstrativos e não refletem registros reais.

---

## Funcionalidades previstas

- Login de administrador e aluno
- Dashboard administrativo
- Cadastro e gerenciamento de alunos
- Gerenciamento de matrículas
- Gerenciamento de mensalidades
- Registro manual de pagamentos
- Histórico financeiro
- Consulta das regras de acesso
- Portal do aluno

---

## Unidades

**Muscle Power** — identificação visual em vermelho  
Planos: mensal, semestral e anual.

**Muscle Evolution** — identificação visual em amarelo  
Planos: mensal, trimestral, semestral e anual.
