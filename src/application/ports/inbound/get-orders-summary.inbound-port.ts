import type { OrderSummaryDto } from '../../dto/order-summary.dto';

/**
 * Porta de entrada (Inbound Port) - Resumo de comandas por dia.
 * Contabiliza somente comandas com status PAID (paga).
 * Retorna quantidade de comandas pagas, valor total e produtos vendidos.
 */
export const GET_ORDERS_SUMMARY_INBOUND_PORT =
  Symbol('GetOrdersSummaryInboundPort');

export interface IGetOrdersSummaryInboundPort {
  /**
   * Retorna o resumo de comandas de um dia (somente comandas pagas).
   * @param date Data no formato YYYY-MM-DD.
   * @returns Resumo com total de comandas pagas, valor total e produtos vendidos.
   */
  execute(date: string): Promise<OrderSummaryDto>;
}
