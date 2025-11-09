# 🧭 Dashboard de Dados e Observabilidade com Node.js, PostgreSQL, Prometheus e Grafana

## 🎯 Objetivo

Este projeto implementa uma aplicação completa de **CRUD (Create, Read, Update, Delete)** em **Node.js**, utilizando **PostgreSQL** como banco de dados e integrando **observabilidade com Prometheus e Grafana**.

Tudo roda em containers via **Docker Compose**, incluindo:
- Aplicação web com API e interface CRUD;
- Banco de dados PostgreSQL;
- Prometheus coletando métricas da aplicação;
- Grafana com dashboards prontos para visualização.

---

## ⚙️ Estrutura do Projeto

```
prom-grafana-node-postgres/
│
├── app/                       # Código da aplicação Node.js
│   ├── Dockerfile             # Build do container da aplicação
│   ├── index.js               # Código principal do servidor Express
│   ├── package.json           # Dependências Node.js
│   └── static/
│       └── index.html         # Interface web do CRUD (frontend simples)
│
├── db/
│   └── init.sql               # Script de inicialização do banco de dados (cria tabela 'items')
│
├── grafana/
│   ├── dashboards/
│   │   └── node_dashboard.json     # Painel do Grafana com métricas + dados SQL
│   └── provisioning/
│       ├── datasources/
│       │   └── all.yml             # Configuração automática das fontes de dados
│       └── dashboards/
│           └── all.yml             # Provisionamento automático de dashboards
│
├── prometheus/
│   └── prometheus.yml         # Configuração de coleta de métricas da aplicação
│
├── docker-compose.yml          # Orquestra todos os serviços na mesma rede
└── README.md                   # Este arquivo
```

---

## 🚀 Como Executar

### 1. Pré-requisitos
- **Docker** e **Docker Compose** instalados.

### 2. Subir todos os serviços
No diretório raiz do projeto, execute:
```bash
docker compose up --build
```

O Docker vai:
1. Criar o banco de dados `appdb` com a tabela `items`;
2. Subir o servidor Node.js em `http://localhost:3000`;
3. Subir o Prometheus em `http://localhost:9090`;
4. Subir o Grafana em `http://localhost:3001`.

---

## 🌐 Acessos

| Serviço       | Endereço local               | Descrição |
|----------------|------------------------------|------------|
| **Aplicação (CRUD)** | [http://localhost:3000](http://localhost:3000) | Interface e API para gerenciar itens |
| **Prometheus** | [http://localhost:9090](http://localhost:9090) | Coleta métricas da aplicação |
| **Grafana** | [http://localhost:3001](http://localhost:3001) | Painéis e visualizações |
| **Banco de Dados (PostgreSQL)** | `localhost:5432` | Usuário: `postgres`, Senha: `postgres` |

---

## 📊 Observabilidade e Dashboards

O **Grafana** é configurado automaticamente ao iniciar o container.

### 🔹 Fontes de dados configuradas
- **Prometheus** (`http://prometheus:9090`)
- **PostgreSQL** (`db:5432`, com `sslmode: disable`)

Arquivo:  
📁 `grafana/provisioning/datasources/all.yml`

---

### 🔹 Painel incluído
Painel JSON:  
📁 `grafana/dashboards/node_dashboard.json`

O painel exibe:
- **Métricas Prometheus**
  - Taxa de requisições (`rate(http_requests_total[1m])`)
  - Latência p50/p95 (`histogram_quantile`)
- **Consultas SQL**
  - Total de registros (`SELECT count(*) FROM items`)
  - Últimos 10 registros (`SELECT ... ORDER BY created_at DESC LIMIT 10`)

---

## 🗃️ Banco de Dados

Script de inicialização:  
📁 `db/init.sql`

Cria automaticamente a tabela:
```sql
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 💻 Aplicação Node.js

- Servidor Express (porta **3000**)
- API CRUD em `/api/items`
- Interface web em `/`
- Endpoint Prometheus em `/metrics`

O Prometheus coleta métricas como:
- `http_requests_total`
- `http_request_duration_seconds`

Essas métricas aparecem automaticamente no painel do Grafana.

---

## 🧩 Rede Docker

Todos os containers estão na **mesma rede bridge** chamada `app_network`:
- `db` — PostgreSQL  
- `app` — Node.js  
- `prometheus` — Coleta métricas  
- `grafana` — Visualização  

Assim, eles se comunicam via nome de serviço (`db`, `app`, `prometheus`, etc.).

---

## 🛠️ Dicas e Solução de Problemas

### ❌ Erro “no such host: postgres”
➡ Corrigido no arquivo de datasource (`db:5432` em vez de `postgres:5432`)

### 🔒 Erro de SSL/TLS
➡ Corrigido com:
```yaml
jsonData:
  sslmode: "disable"
```
no arquivo `grafana/provisioning/datasources/all.yml`

---

## 📦 Encerrando
Para parar todos os containers:
```bash
docker compose down
```

Para limpar volumes e dados:
```bash
docker compose down -v
```

---

## 💡 Próximos Passos (opcionais)
- Adicionar autenticação na API e no frontend.  
- Incluir **Node Exporter** para monitorar CPU e memória do host.  
- Criar novos painéis no Grafana com métricas personalizadas.  
- Popular o banco com dados de exemplo automáticos.

---

✍️ **Autor:** Ambiente de Observabilidade — Projeto Acadêmico  
📅 **Data:** Novembro de 2025
