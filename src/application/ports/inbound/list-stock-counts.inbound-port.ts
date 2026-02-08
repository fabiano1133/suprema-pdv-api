import type { StockCount } from '../../../domain/entities/stock-count';

/**
 * Porta de entrada: Listar conferências/balanços.
 */
export const LIST_STOCK_COUNTS_INBOUND_PORT = Symbol(
  'ListStockCountsInboundPort',
);

export interface IListStockCountsInboundPort {
  execute(): Promise<StockCount[]>;
}
