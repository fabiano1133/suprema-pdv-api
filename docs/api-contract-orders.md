# Contrato da API – Orders (Comandas)

Base URL: `http://localhost:3000/api/v1` (ou a URL do ambiente).

Todas as respostas de erro seguem o formato do exception filter (ex.: `{ "statusCode": 400, "message": "..." }`).  
O ValidationPipe retorna **400** com mensagens de validação quando o body/query não segue o contrato.

---

## Enums / constantes

### Status da comanda (resposta)
| Valor       | Descrição |
|------------|-----------|
| `OPEN`     | Comanda aberta |
| `PAID`     | Comanda paga (fechada) |
| `CANCELLED`| Comanda cancelada |
| `REFUNDED` | Comanda estornada |

### Forma de pagamento (fechar comanda)
| Valor         | Descrição   |
|---------------|-------------|
| `PIX`         | PIX         |
| `MONEY`       | Dinheiro    |
| `CREDIT_CARD` | Cartão de crédito |
| `DEBIT_CARD`  | Cartão de débito  |

---

## Endpoints

### 1. Criar comanda

**POST** `/api/v1/orders`

- **Body (JSON):** opcional. Pode ser `{}` ou enviar `client`.
- **Request body (CreateOrderDto):**

```json
{
  "client": "string (opcional, máx. 200 caracteres)"
}
```

- **Resposta:** `200` – `OrderResponseDto` (comanda criada com `status: "OPEN"`, `paymentMethod: null`, `lines: []`).

---

### 2. Listar comandas (paginado)

**GET** `/api/v1/orders`

- **Query (ListOrdersDto):** todos opcionais.

| Parâmetro  | Tipo   | Descrição |
|------------|--------|-----------|
| `status`   | string | `OPEN` \| `PAID` \| `CANCELLED` \| `REFUNDED` \| `ALL` (padrão: ALL) |
| `startDate`| string | Data inicial (inclusive). Formato `YYYY-MM-DD` |
| `endDate`  | string | Data final (inclusive). Formato `YYYY-MM-DD` |
| `page`     | number | Página (1-based). Padrão: 1 |
| `limit`    | number | Itens por página (1–100). Padrão: 10 |

- **Resposta:** `200` – `PaginatedOrdersResponseDto`:

```ts
{
  "data": OrderResponseDto[],
  "meta": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number,
    "hasNextPage": boolean,
    "hasPreviousPage": boolean
  }
}
```

---

### 3. Buscar comanda por ID

**GET** `/api/v1/orders/:id`

- **Path:** `id` – UUID da comanda.
- **Resposta:** `200` – `OrderResponseDto`.  
- **Erro:** `404` se a comanda não existir.

---

### 4. Fechar comanda (pagar)

**PATCH** `/api/v1/orders/:id/pay`

- **Path:** `id` – UUID da comanda.
- **Body (JSON) obrigatório – PayOrderDto:**

```json
{
  "paymentMethod": "PIX"
}
```

- **Valores aceitos para `paymentMethod`:** `PIX` | `MONEY` | `CREDIT_CARD` | `DEBIT_CARD`.
- **Resposta:** `200` – `OrderResponseDto` (comanda com `status: "PAID"` e `paymentMethod` preenchido).
- **Erros:**
  - `404` – Comanda não encontrada.
  - `400` – Body inválido (ex.: `paymentMethod` ausente ou valor não permitido).
  - `400` (DomainValidationException) – Comanda sem itens ou estoque insuficiente (mensagem no `message` da resposta).

---

### 5. Adicionar item à comanda

**POST** `/api/v1/orders/:id/items`

- **Path:** `id` – UUID da comanda.
- **Body (JSON) – AddItemToOrderDto:**

```json
{
  "itemId": "uuid do item (produto)",
  "quantity": 1
}
```

- **Regras:** `quantity` inteiro ≥ 1.
- **Resposta:** `200` – `OrderResponseDto` (comanda atualizada).
- **Erro:** `404` se a comanda ou o item não existir; `400` se validação falhar.

---

### 6. Remover item da comanda

**DELETE** `/api/v1/orders/:id/items/:itemId`

- **Path:** `id` – UUID da comanda; `itemId` – UUID do item (produto).
- **Resposta:** `200` – `OrderResponseDto`.
- **Erro:** `404` se a comanda não existir ou a linha do item não existir na comanda.

---

### 7. Resumo de vendas (dia)

**GET** `/api/v1/orders/summary?date=YYYY-MM-DD`

- **Query:** `date` (opcional) – data no formato `YYYY-MM-DD`. Se omitido, usa a data atual.
- **Resposta:** `200` – `OrderSummaryDto`:

```ts
{
  "date": string,           // "YYYY-MM-DD"
  "totalOrders": number,
  "totalValue": number,
  "comandaNumbers": string[],
  "productsSold": {
    "itemId": string,
    "productName": string,
    "quantitySold": number,
    "totalAmount": number
  }[],
  "salesLines": {
    "comandaNumber": string,
    "productName": string,
    "quantitySold": number,
    "totalAmount": number
  }[]
}
```

---

### 8. Resumo de vendas em PDF

**GET** `/api/v1/orders/summary/pdf?date=YYYY-MM-DD`

- **Query:** `date` (opcional) – mesmo que no resumo JSON.
- **Resposta:** `200` – `application/pdf` (stream do arquivo).

---

## Formato da comanda (OrderResponseDto)

Usado em: criar, listar, buscar por ID, fechar, adicionar item, remover item.

```ts
{
  "id": string,              // UUID
  "comNumber": string,       // ex.: "COM-0001"
  "status": string,          // OPEN | PAID | CANCELLED | REFUNDED
  "total": number,           // valor total (decimal)
  "client": string,          // nome do cliente ("" se não informado)
  "paymentMethod": string | null,  // PIX | MONEY | CREDIT_CARD | DEBIT_CARD ou null (comanda aberta)
  "lines": {
    "itemId": string,
    "quantity": number,
    "unitPrice": number,
    "productName"?: string,
    "subtotal": number
  }[],
  "createdAt": string,       // ISO 8601
  "updatedAt": string        // ISO 8601
}
```

---

## Resumo para o front

| Ação              | Método   | URL                          | Body (quando aplicável) |
|-------------------|----------|------------------------------|--------------------------|
| Criar comanda     | POST     | `/api/v1/orders`              | `{}` ou `{ "client": "..." }` |
| Listar comandas   | GET      | `/api/v1/orders?status=OPEN&page=1&limit=10` | — |
| Buscar comanda    | GET      | `/api/v1/orders/:id`          | — |
| Fechar comanda    | PATCH    | `/api/v1/orders/:id/pay`      | `{ "paymentMethod": "PIX" }` (obrigatório) |
| Adicionar item    | POST     | `/api/v1/orders/:id/items`    | `{ "itemId": "uuid", "quantity": 1 }` |
| Remover item      | DELETE   | `/api/v1/orders/:id/items/:itemId` | — |
| Resumo (JSON)     | GET      | `/api/v1/orders/summary?date=YYYY-MM-DD` | — |
| Resumo (PDF)      | GET      | `/api/v1/orders/summary/pdf?date=YYYY-MM-DD` | — |

**Importante:** No **PATCH** de fechar comanda, o body deve conter **exatamente** o campo `paymentMethod` (e nenhum campo extra, pois `forbidNonWhitelisted` está ativo). Valores válidos: `PIX`, `MONEY`, `CREDIT_CARD`, `DEBIT_CARD`.
