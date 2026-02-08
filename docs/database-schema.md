# Esquema do banco de dados – Suprema PDV API

## Situação atual

A aplicação **não utiliza banco de dados** hoje. A persistência é feita por repositórios **in-memory** (`InMemoryItemRepository`, `InMemoryOrderRepository`, `InMemoryOrderItemRepository`), que armazenam dados em `Map` na memória. Os dados são perdidos ao reiniciar o servidor.

Não há TypeORM, Prisma, Sequelize ou migrações no projeto. O modelo de domínio (entidades e value objects) define a estrutura lógica; ao conectar um banco real, o esquema abaixo deve ser usado.

---

## Esquema lógico (para implementação futura)

O modelo de domínio atual implica o seguinte desenho de tabelas.

### Diagrama relacional (texto)

```
┌─────────────────────────────────────────────────────────────────┐
│ items                                                            │
├─────────────────────────────────────────────────────────────────┤
│ id              VARCHAR(36)  PK                                  │
│ name            VARCHAR(255) NOT NULL                            │
│ price           DECIMAL(10,2) NOT NULL                            │
│ cost_price      DECIMAL(10,2) NOT NULL                            │
│ sku             VARCHAR(50)  NOT NULL  UNIQUE                     │
│ barcode         VARCHAR(13)  NOT NULL                             │
│ quantity        INTEGER      NOT NULL  DEFAULT 0  (só entrada/    │
│                              saída: entrada de notas, fechamento)│
│ description     TEXT                                             │
│ created_at      TIMESTAMP    NOT NULL                            │
│ updated_at      TIMESTAMP    NOT NULL                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ stock_entries (entrada de notas/pedidos)                          │
├─────────────────────────────────────────────────────────────────┤
│ id              VARCHAR(36)  PK                                  │
│ reference       VARCHAR(100) NULL  (número nota, pedido, etc.)   │
│ supplier        VARCHAR(200) NULL  (fornecedor)                  │
│ created_at      TIMESTAMP    NOT NULL                            │
└─────────────────────────────────────────────────────────────────┘
        │ 1
        │ N
┌─────────────────────────────────────────────────────────────────┐
│ stock_entry_lines                                                │
├─────────────────────────────────────────────────────────────────┤
│ stock_entry_id   VARCHAR(36)  NOT NULL  FK → stock_entries(id)   │
│ item_id          VARCHAR(36)  NOT NULL  FK → items(id)            │
│ quantity         INTEGER      NOT NULL  (quantidade recebida)    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ orders                                                           │
├─────────────────────────────────────────────────────────────────┤
│ id              VARCHAR(36)  PK                                  │
│ status          VARCHAR(20)  NOT NULL  (OPEN|PAID|CANCELLED|     │
│                              REFUNDED)                           │
│ total           DECIMAL(10,2) NOT NULL  DEFAULT 0                 │
│ com_number      VARCHAR(20)  NOT NULL  UNIQUE  (ex: COM-0001)     │
│ client          VARCHAR(255) NULL                                │
│ created_at      TIMESTAMP    NOT NULL                            │
│ updated_at      TIMESTAMP    NOT NULL                            │
└─────────────────────────────────────────────────────────────────┘
        │
        │ 1
        │
        │ N
┌─────────────────────────────────────────────────────────────────┐
│ order_lines                                                      │
├─────────────────────────────────────────────────────────────────┤
│ id              VARCHAR(36)  PK   (opcional; pode ser composta) │
│ order_id        VARCHAR(36)  NOT NULL  FK → orders(id)            │
│ item_id         VARCHAR(36)  NOT NULL  FK → items(id)             │
│ quantity        INTEGER      NOT NULL                            │
│ unit_price      DECIMAL(10,2) NOT NULL  (snapshot na venda)      │
│ product_name    VARCHAR(255) NULL    (snapshot na venda)          │
│ created_at      TIMESTAMP    NOT NULL                            │
│ updated_at      TIMESTAMP    NOT NULL                            │
└─────────────────────────────────────────────────────────────────┘
```

- **items**: catálogo de produtos; `quantity` = estoque (inicia em 0; só muda por entrada de notas ou baixa na venda).
- **stock_entries**: entrada de estoque (nota/pedido); cada entrada tem linhas (`stock_entry_lines`) que somam ao estoque do item.
- **orders**: comandas/vendas; `com_number` = código da comanda (ex.: COM-0001).
- **order_lines**: linhas do pedido (equivalente ao value object `OrderLine`); `unit_price` e `product_name` são snapshot na venda (não join com `items` na leitura).

### Observações

1. **Order no domínio**: o agregado `Order` contém uma lista de `OrderLine` (value object). Em banco relacional isso vira tabela `orders` + tabela `order_lines` com `order_id` e `item_id`.
2. **OrderItem**: existe a entidade de domínio `OrderItem` e o repositório in-memory correspondente, mas os use cases atuais usam `Order` + `OrderLine`. O esquema acima reflete o que está em uso (orders + order_lines).
3. **Estoque**: **entrada** — apenas por entrada de notas/pedidos (`stock_entries` + `stock_entry_lines`), que somam em `items.quantity`. **Saída** — ao fechar a venda (status PAID), o use case faz a baixa em `Item.quantity`. O cadastro/atualização de produto não altera mais a quantidade.
4. **Sequência com_number**: hoje é contador em memória no repositório; em banco pode ser sequence, tabela de controle ou `MAX(com_number)+1` com cuidado para concorrência.

---

## Onde está a “persistência” hoje

| Conceito   | Camada atual                    | Onde os dados ficam              |
|-----------|----------------------------------|----------------------------------|
| Item        | `InMemoryItemRepository`         | `Map<string, Item>`              |
| StockEntry  | `InMemoryStockEntryRepository`   | `Map<string, StockEntry>` (histórico de entradas) |
| Order       | `InMemoryOrderRepository`        | `Map<string, Order>` (Order com `lines: OrderLine[]` em memória) |
| OrderItem   | `InMemoryOrderItemRepository`    | `Map<string, OrderItem>` (não usado pelos use cases de Order)    |

Ou seja: não há DDL, migrações nem conexão com SGBD; o “esquema” é o formato dos objetos de domínio na memória. O arquivo acima serve como referência para o dia em que você introduzir um banco (ex.: PostgreSQL + TypeORM ou Prisma).
