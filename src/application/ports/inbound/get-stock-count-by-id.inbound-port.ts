import type { StockCount } from '../../../domain/entities/stock-count';

/**
 * Porta de entrada: Buscar conferência/balanço por ID.
 */
export const GET_STOCK_COUNT_BY_ID_INBOUND_PORT = Symbol(
  'GetStockCountByIdInboundPort',
);

export interface IGetStockCountByIdInboundPort {
  execute(id: string): Promise<StockCount | null>;
}
