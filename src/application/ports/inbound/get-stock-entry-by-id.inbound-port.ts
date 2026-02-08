import type { StockEntry } from '../../../domain/entities/stock-entry';

/**
 * Porta de entrada (Inbound Port): Buscar entrada de estoque (pedido) por ID.
 */
export const GET_STOCK_ENTRY_BY_ID_INBOUND_PORT = Symbol(
  'GetStockEntryByIdInboundPort',
);

export interface IGetStockEntryByIdInboundPort {
  execute(id: string): Promise<StockEntry | null>;
}
