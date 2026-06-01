# Band Tools API

> API REST projetada para gerenciar informações de bandas musicais.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](./coverage)
[![License](https://img.shields.io/badge/license-UNLICENSED-red)](./package.json)

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando a aplicação](#executando-a-aplicação)
- [Documentação da API](#documentação-da-api)
- [Testes](#testes)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Path aliases](#path-aliases)
- [Scripts disponíveis](#scripts-disponíveis)

---

## Sobre o projeto

A **Band Tools API** é uma API REST construída com [NestJS](https://nestjs.com) e [Fastify](https://fastify.dev), seguindo os princípios da Clean Architecture. O projeto separa claramente as responsabilidades em camadas de aplicação, HTTP e utilitários compartilhados, facilitando a escalabilidade e a manutenção.

Recursos incluídos:

- Endpoint de **health check** para monitoramento da aplicação
- Documentação interativa via **Scalar UI** em `/openapi`
- Validação de variáveis de ambiente na inicialização
- Middleware global de **filtro de exceções** padronizadas
- Middleware global de **sanitização de strings** (trim automático em `body`, `query` e `params`)
- **CORS** configurado
- Cobertura de testes unitários em **100%**

---

## Tecnologias

| Categoria    | Tecnologia                          | Versão   |
| ------------ | ----------------------------------- | -------- |
| Runtime      | Node.js                             | 22.x     |
| Framework    | NestJS                              | ^11.0.1  |
| HTTP adapter | Fastify                             | ^11.1.24 |
| Linguagem    | TypeScript                          | ^5.7.3   |
| Documentação | Swagger + Scalar UI                 | ^11.4.4  |
| Validação    | class-validator + class-transformer | ^0.15.1  |
| Configuração | @nestjs/config                      | ^4.0.4   |
| Testes       | Jest + ts-jest                      | ^30.0.0  |
| Linting      | ESLint + Prettier                   | ^9.18.0  |
| Git hooks    | Husky                               | ^9.1.7   |

---

## Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org) >= 22.x
- [npm](https://npmjs.com) >= 11.x

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/orlandocorreia2/band-tools-api.git
cd backend

# 2. Instale as dependências
npm install
```

---

## Configuração

Crie um arquivo `.env` na raiz do projeto com base nas variáveis abaixo:

```env
# Ambiente de execução
# Valores aceitos: development | homologation | production | test | local
STAGE=development

# Porta em que a API será iniciada
PORT=3000
```

> **Nota:** `SERVICE_NAME` e `SERVICE_VERSION` são preenchidos automaticamente a partir do `package.json` durante a inicialização.

---

## Executando a aplicação

```bash
# Desenvolvimento (modo watch)
npm run start:dev

# Produção
npm run build
npm run start:prod

# Debug
npm run start:debug
```

A API estará disponível em `http://localhost:3000`.

---

## Documentação da API

A documentação interativa é gerada automaticamente via Swagger e acessível através da **Scalar UI**:

```
http://localhost:3000/openapi
```

### Endpoints disponíveis

| Método | Rota      | Descrição                      |
| ------ | --------- | ------------------------------ |
| GET    | `/health` | Verifica o status da aplicação |

#### Exemplo de resposta — `GET /health`

```json
{
  "status": "Healthy",
  "uptime": 123.45,
  "name": "band-tools-api",
  "version": "0.0.1",
  "message": "Security Darkweb Api is up!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Testes

O projeto usa [Jest](https://jestjs.io) com **100% de cobertura** em statements, branches, funções e linhas.

```bash
# Executar todos os testes unitários
npm test

# Executar com relatório de cobertura
npm run test:cov

# Executar em modo watch
npm run test:watch

# Executar testes e2e
npm run test:e2e
```

> **Pre-commit hook:** o Husky executa `npm test` automaticamente antes de cada commit, impedindo commits com testes falhando.

---

## Estrutura do projeto

```
src/
├── main.ts                          # Ponto de entrada da aplicação
├── app.module.ts                    # Módulo raiz
│
├── application/
│   └── usecase/
│       └── health-check/            # Caso de uso: health check
│           ├── health-check.usecase.ts
│           └── interfaces/
│
├── http/
│   ├── http.module.ts               # Módulo HTTP
│   ├── health-check/
│   │   ├── health-check.controller.ts
│   │   └── health-check-factory.module.ts
│   └── middlewares/
│       ├── exception-filter.middleware.ts   # Filtro global de exceções
│       └── trim-strings.middleware.ts       # Sanitização de strings
│
└── shared/
    ├── commons/
    │   ├── enums/                   # Enums compartilhados
    │   └── openapi.commons.ts       # Builder de documentação OpenAPI
    ├── communication/
    │   └── dtos/                    # Data Transfer Objects
    ├── config/
    │   ├── env-config.module.ts     # Módulo de configuração de ambiente
    │   ├── env-config.service.ts    # Serviço de acesso às variáveis
    │   └── env-config.validation.ts # Validação de variáveis de ambiente
    ├── exceptions/
    │   ├── base.exception.ts        # Exceção base
    │   └── business.exception.ts   # Exceções de negócio (401, 400, 404...)
    ├── helpers/
    │   └── error.ts                 # Mensagens de erro padrão
    └── interfaces/
        └── interface.ts             # Interfaces genéricas compartilhadas

test/
├── unit/                            # Testes unitários (espelham src/)
└── setEnvVars.js                    # Setup global dos testes
```

---

## Path aliases

O projeto utiliza aliases de caminho configurados no `tsconfig.json` para evitar imports relativos longos:

| Alias               | Caminho real                |
| ------------------- | --------------------------- |
| `@shared/*`         | `src/shared/*`              |
| `@http/*`           | `src/http/*`                |
| `@usecase/*`        | `src/application/usecase/*` |
| `@domain/*`         | `src/domain/*`              |
| `@infrastructure/*` | `src/infrastructure/*`      |
| `@package.json`     | `package.json`              |

---

## Scripts disponíveis

| Script                | Descrição                                        |
| --------------------- | ------------------------------------------------ |
| `npm run build`       | Compila o projeto para `dist/`                   |
| `npm run start`       | Inicia a aplicação compilada                     |
| `npm run start:dev`   | Inicia em modo desenvolvimento com hot-reload    |
| `npm run start:debug` | Inicia em modo debug com hot-reload              |
| `npm run start:prod`  | Inicia a partir do build de produção             |
| `npm run lint`        | Executa o ESLint e corrige problemas automáticos |
| `npm run format`      | Formata o código com Prettier                    |
| `npm test`            | Executa os testes unitários                      |
| `npm run test:cov`    | Executa testes com relatório de cobertura        |
| `npm run test:watch`  | Executa testes em modo watch                     |
| `npm run test:e2e`    | Executa testes end-to-end                        |
