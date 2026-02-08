/**
 * Linha da conferência/balanço na resposta HTTP.
 * Após finalizar: inclui systemQuantity e variance (contado - sistema).
 */
export interface StockCountLineResponseDto {
  itemId: string;
  /** Quantidade contada pelo coletor (bipagem). */
  countedQuantity: number;
  /** Quantidade no sistema no momento da finalização (apenas se finalizado). */
  systemQuantity?: number;
  /** Diferença: contado - sistema. Positivo = sobra, negativo = falta (apenas se finalizado). */
  variance?: number;
}

/**
 * Resposta HTTP para conferência/balanço.
 */
export interface StockCountResponseDto {
  id: string;
  /** Código interno exibido (ex: BAL-001), gerado automaticamente. */
  code: string;
  name: string;
  description: string;
  /** IN_PROGRESS = em andamento; FINALIZED = finalizado (comparação disponível). */
  status: string;
  lines: StockCountLineResponseDto[];
  createdAt: string;
  /** Data/hora da finalização (apenas se finalizado). */
  finalizedAt?: string;
}
