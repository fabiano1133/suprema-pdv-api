/**
 * DTO de resposta HTTP para linha de entrada de estoque.
 */
export interface StockEntryLineResponseDto {
  itemId: string;
  quantity: number;
}

/**
 * DTO de resposta HTTP para Entrada de Estoque (nota/pedido).
 */
export interface StockEntryResponseDto {
  id: string;
  /** Número da nota, pedido ou referência (opcional). */
  reference?: string;
  /** Fornecedor (opcional). */
  supplier?: string;
  lines: StockEntryLineResponseDto[];
  createdAt: string;
}
