import type { StockCount } from '../../../domain/entities/stock-count';

/**
 * Porta de entrada: Finalizar balanço e comparar quantidade contada com sistema.
 */
export const FINALIZE_STOCK_COUNT_INBOUND_PORT = Symbol(
  'FinalizeStockCountInboundPort',
);

export interface IFinalizeStockCountInboundPort {
  execute(countId: string): Promise<StockCount | null>;
}
