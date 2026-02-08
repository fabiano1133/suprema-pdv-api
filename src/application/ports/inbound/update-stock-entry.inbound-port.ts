import type { StockEntry } from '../../../domain/entities/stock-entry';
import type { UpdateStockEntryDto } from '../../dto/update-stock-entry.dto';

/**
 * Porta de entrada (Inbound Port): Atualizar entrada de estoque (pedido).
 * Apenas referência e fornecedor podem ser alterados.
 */
export const UPDATE_STOCK_ENTRY_INBOUND_PORT = Symbol(
  'UpdateStockEntryInboundPort',
);

export interface IUpdateStockEntryInboundPort {
  execute(id: string, dto: UpdateStockEntryDto): Promise<StockEntry | null>;
}
