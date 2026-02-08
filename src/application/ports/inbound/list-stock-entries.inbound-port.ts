import type { StockEntry } from '../../../domain/entities/stock-entry';

/**
 * Porta de entrada: Listar entradas de estoque (histórico/auditoria).
 */
export const LIST_STOCK_ENTRIES_INBOUND_PORT = Symbol(
  'ListStockEntriesInboundPort',
);

export interface IListStockEntriesInboundPort {
  execute(): Promise<StockEntry[]>;
}
