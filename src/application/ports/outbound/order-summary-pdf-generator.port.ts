import type { OrderSummaryDto } from '../../dto/order-summary.dto';

/**
 * Porta de saída (Outbound Port) - Gerador de PDF do resumo de comandas por dia.
 */
export const ORDER_SUMMARY_PDF_GENERATOR_PORT =
  Symbol('OrderSummaryPdfGeneratorPort');

export interface IOrderSummaryPdfGeneratorPort {
  /**
   * Gera um PDF com o resumo do dia (total de comandas, valor total, produtos vendidos).
   * @param summary Dados do resumo (OrderSummaryDto).
   * @returns Buffer do PDF.
   */
  generate(summary: OrderSummaryDto): Promise<Buffer>;
}
