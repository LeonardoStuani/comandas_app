# Comandas Stuani — Frontend

Aplicação web para gestão de comandas de restaurante/bar: cadastro de produtos, clientes e equipe, abertura e gestão de comandas, lançamento de itens e um terminal de caixa (checkout) com geração de nota para impressão.

Este repositório contém **apenas o frontend** (React + Vite). Ele consome uma API REST externa (FastAPI), que roda separadamente.

## Stack

- **React 19** + **Vite**
- **React Router** para roteamento
- **MUI** (formulários/diálogos) + design system próprio em CSS (tokens, tema claro/escuro)
- **Axios** para consumo da API (com refresh de token automático)
- **React Hook Form** nos formulários

## Funcionalidades

- Autenticação JWT com refresh automático e rotas protegidas por grupo (Admin / Garçom / Caixa)
- **Dashboard** com métricas reais (faturamento, ticket médio, top produtos, comandas por status)
- **Comandas**: listagem com filtros e paginação, abertura, edição, cancelamento e exclusão
- **Comanda aberta**: lançamento, edição e remoção de itens, total em tempo real, fechamento
- **Produtos**: CRUD com foto (compressão automática no cliente para caber no banco)
- **Clientes** e **Equipe (funcionários)**: CRUD
- **Caixa (checkout)**: seleção de uma ou várias comandas, conferência consolidada de itens,
  desconto/acréscimo, forma de pagamento e **geração de nota para impressão**

## Como rodar

Pré-requisitos: Node.js 18+ e a API rodando (HTTPS na porta 8443 por padrão).

```bash
cd frontend
npm install
cp .env.example .env   # ajuste as variáveis se necessário
npm run dev
```

A aplicação sobe em `http://localhost:5173`. As chamadas vão para `/api`, que o proxy do
Vite encaminha para a API definida em `VITE_PROXY_TARGET`.

### Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (`dist/`) |
| `npm run preview` | Pré-visualiza o build |
| `npm run lint` | ESLint |

## Variáveis de ambiente

Veja [`frontend/.env.example`](frontend/.env.example). O arquivo `.env` real é ignorado pelo Git.

| Variável | Descrição |
|---|---|
| `VITE_API_BASE_URL` | Base do axios (use `/api` para passar pelo proxy do Vite) |
| `VITE_API_TIMEOUT` | Timeout das requisições (ms) |
| `VITE_PROXY_TARGET` | Alvo do proxy do Vite (URL da API) |
| `VITE_PROXY_SECURE` | `false` ignora certificado SSL auto-assinado em dev |

## Estrutura

```
frontend/src/
├── components/   # AppShell, Logo, formulários e componentes comuns
├── context/      # AuthContext, ThemeContext
├── pages/        # Dashboard, Comandas, Caixa, Produtos, Clientes, Equipe...
├── routes/       # Definição de rotas
├── services/     # Camada de acesso à API (axios)
└── utils/        # Helpers (grupos, foto, máscaras, snackbar)
```
