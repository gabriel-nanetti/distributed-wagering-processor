# ARCHITECTURE.md

## Stack e decisões técnicas

### Runtime e framework
- **Bun 1.x** como runtime e package manager
- **NestJS** como framework HTTP e container de injeção de dependência
- **TypeScript** em modo estrito

### ORM
Escolhemos **MikroORM v6** (downgrade do v7 instalado inicialmente) porque:
- v7 abandonou decorators em favor de `EntitySchema`, quebrando compatibilidade com o ecossistema NestJS atual
- v6 oferece `LockMode.PESSIMISTIC_WRITE` explícito, `em.transactional()` com Unit of Work e Identity Map — exatamente o que o desafio exige
- `EntityManager.transactional()` garante atomicidade entre wallet, ledger, inbox e outbox numa única transação SQL

### Banco
**PostgreSQL 16** com as seguintes garantias aplicadas no schema:
- `UNIQUE(player_id, currency)` em wallets — no máximo uma wallet por jogador por moeda
- `UNIQUE(provider_id, external_transaction_id)` em wager_transactions
- `UNIQUE(consumer_name, message_id)` em inbox_messages — deduplicação persistente
- `NUMERIC(18,2)` para todos os valores monetários — sem float, sem perda de precisão

### Dinheiro
A classe `Money` usa **Decimal.js** internamente e é serializada como string decimal (`"25.00"`) em todos os contratos e na persistência. `number`, `float` e `double` não são usados em nenhum ponto do fluxo financeiro.

## Concorrência

A unidade de concorrência é a `walletId`. Usamos **pessimistic locking** (`SELECT FOR UPDATE`) via `LockMode.PESSIMISTIC_WRITE` do MikroORM, sempre dentro de `em.transactional()`.

Por que pessimistic e não optimistic?
- Apostas simultâneas na mesma wallet são esperadas e frequentes
- Optimistic locking com retry aumenta latência e complexidade em cenários de contenção alta
- O lock é por wallet, não global — wallets diferentes são processadas em paralelo sem bloqueio

Cenário validado: duas apostas de 80.00 BRL com saldo de 100.00 BRL processadas simultaneamente resultam em exatamente uma `PROCESSED` e uma `REJECTED`, saldo final 20.00 BRL, um único lançamento no ledger.

## Idempotência

Dois níveis:
1. **Header `Idempotency-Key`** — chave fornecida pelo provedor
2. **`payloadHash`** — SHA-256 de um string canônico dos campos de negócio

Mesma key + mesmo payload → replay seguro, retorna resultado original.
Mesma key + payload diferente → `409 Conflict`.

A deduplicação é persistida em `inbox_messages` (para mensagens SQS) e em `wager_transactions` (para HTTP). Nunca em memória.

## Transactional Outbox

Inbox, operação financeira, ledger e outbox participam da mesma transação SQL. O evento só existe no outbox após o commit — nunca antes.

Um worker dedicado (`OutboxWorker`) publica os eventos pendentes com backoff exponencial. Múltiplos publishers são seguros porque usam `nativeUpdate` com condição `publishedAt = null`.

## Separação de responsabilidades

- `domain/` — lógica de negócio pura, sem dependência de ORM, HTTP ou mensageria
- `application/` — use cases, orquestram domínio e infraestrutura
- `infrastructure/` — entidades ORM, repositórios, consumers SQS, worker outbox
- Controllers HTTP são adaptadores de entrada — traduzem HTTP para comandos do use case

## Autenticação

Não implementada neste desafio. O ponto de extensão está arquitetado: um `AuthGuard` pode ser adicionado como decorator nos controllers sem alterar a lógica de negócio. A recomendação seria integrar **Keycloak** ou **Zitadel** via OIDC, validando JWT no guard antes de chegar ao use case.

## Limitações conhecidas

- `PENDING_REFERENCE` não implementado — transações com referência ausente são rejeitadas em vez de aguardar
- `ROLLBACK` não implementado completamente
- Outbox publica na mesma fila de entrada (loop) — em produção usaria uma fila de eventos separada
- Logs ainda não são JSON estruturado — falta integrar `pino` ou similar
- Métricas não implementadas
- Testes de concorrência com múltiplas instâncias não executados