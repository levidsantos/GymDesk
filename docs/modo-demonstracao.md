# Modo demonstrativo

O GymDesk possui um modo demonstrativo (frontend-only) que permite utilizar o sistema sem depender do backend Express ou do banco de dados SQLite. Nesse modo, toda a lógica de negócio e os dados são simulados em memória no navegador.

---

## Diferenças entre os modos

| Aspecto | Modo local (padrão) | Modo demonstrativo |
|---|---|---|
| Backend | Node.js + Express + SQLite | Não utilizado |
| Dados | Banco de dados persistente | Memória do navegador (sessão) |
| API | Requisições HTTP ao servidor | Mock local via módulo JS |
| Autenticação | Sessões com cookie HTTP-only | Simulada em memória |
| Persistência | Dados mantidos entre sessões | Dados perdidos ao recarregar a página |
| Configuração | `npm run dev` | `VITE_DEMO=true` |

---

## Como funciona

O modo demonstrativo é controlado pela variável de ambiente `VITE_DEMO`. Quando definida como `true`:

1. O módulo `client/src/lib/api.js` direciona as chamadas para `client/src/demo/api.js` em vez de fazer requisições HTTP.
2. Os dados fictícios são criados em memória pelo módulo `client/src/demo/data.js`, que espelha o script `server/src/database/seed-demo.js`.
3. Toda a lógica de negócio (login, matrículas, pagamentos, regras de acesso, expiração de matrículas) é simulada pelo mock.

Quando `VITE_DEMO` não está definida ou é diferente de `true`, o sistema funciona normalmente, fazendo requisições ao backend.

---

## Executar localmente

### Modo demonstrativo (sem backend)

```bash
cd client
VITE_DEMO=true npx vite
```

Acesse `http://localhost:5173`.

### Modo normal (com backend)

```bash
npm run dev
```

---

## Gerar build para publicação

```bash
cd client
VITE_DEMO=true npx vite build
```

O resultado é gerado em `client/dist/` e pode ser publicado em qualquer serviço de hospedagem de sites estáticos.

### Configuração para Vercel

O arquivo `client/vercel.json` já contém a configuração necessária para SPA:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Para publicar na Vercel:
1. Configure o diretório raiz como `client`.
2. Configure o comando de build como `VITE_DEMO=true vite build`.
3. Configure o diretório de saída como `dist`.

---

## Contas disponíveis

| E-mail | Senha | Perfil | Cenário |
|---|---|---|---|
| admin@email.com | admin123 | Admin | Acesso completo à área administrativa |
| lucas.ferreira@email.com | senha123 | Aluno | Muscle Power Semestral, ativo, em dia |
| beatriz.oliveira@email.com | senha123 | Aluno | Muscle Evolution Anual, ativa, em dia |
| rafael.mendes@email.com | senha123 | Aluno | Muscle Power Mensal, ativo, mensalidade em aberto |
| juliana.costa@email.com | senha123 | Aluno | Muscle Evolution Trimestral, ativa, em dia |
| thiago.almeida@email.com | senha123 | Aluno | Muscle Power Anual, inativo, histórico preservado |
| mariana.lopes@email.com | senha123 | Aluno | Sem matrícula, primeiro acesso (troca de senha obrigatória) |

Na tela de login do modo demonstrativo, as credenciais principais são exibidas automaticamente para facilitar o acesso.

---

## Dados em memória

Os dados são criados quando o aplicativo é carregado e existem apenas na sessão do navegador.

**O que persiste durante a sessão:**
- Alunos criados ou editados.
- Matrículas criadas ou inativadas.
- Pagamentos registrados.
- Inativações e reativações de alunos.
- Alteração de senha.

**O que é perdido ao recarregar a página:**
- Todas as alterações feitas durante a sessão.
- Os dados retornam ao estado inicial (os 6 alunos fictícios com seus cenários originais).

---

## Limitações do modo demonstrativo

- Os dados não são persistidos entre sessões ou recarregamentos.
- A autenticação é simulada e não utiliza cookies HTTP-only reais.
- Não há validação de hash de senha — a comparação é feita em texto simples contra as senhas predefinidas.
- O delay de resposta é simulado (150ms) para dar uma experiência mais natural, mas não reflete latência real de rede.
- Funcionalidades que dependam de horário do servidor (expiração automática de matrículas, verificação de acesso) utilizam o relógio do navegador do usuário.

---

## Estrutura dos arquivos

```
client/src/demo/
├── index.js    # Exporta o flag IS_DEMO
├── data.js     # Dados fictícios (espelha seed-demo.js)
└── api.js      # Mock de todos os endpoints da API

client/src/lib/
└── api.js      # apiFetch centralizado (roteia para mock ou fetch real)
```
