/**
 * DTO de resposta HTTP para Order (venda).
 */
export interface OrderLineResponseDto {
  itemId: string;
  quantity: number;
  unitPrice: number;
  productName?: string;
  subtotal: number;
}

export interface OrderResponseDto {
  id: string;
  /** Código da comanda (ex.: COM-0001, COM-0002). */
  comNumber: string;
  status: string;
  total: number;
  /** Nome do cliente (string vazia quando não informado). */
  client: string;
  /** Forma de pagamento ao fechar (null enquanto comanda aberta). */
  paymentMethod: string | null;
  lines: OrderLineResponseDto[];
  createdAt: string;
  updatedAt: string;
}

/** Meta de paginação na resposta HTTP. */
export interface PaginationMetaResponseDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Resposta paginada de comandas (orders). */
export interface PaginatedOrdersResponseDto {
  data: OrderResponseDto[];
  meta: PaginationMetaResponseDto;
}
