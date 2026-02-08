import type { StockEntry } from '../../../domain/entities/stock-entry';
import type { RegisterStockEntryDto } from '../../dto/register-stock-entry.dto';

/**
 * Porta de entrada (Inbound Port): Registrar entrada de estoque.
 * Entrada de notas/pedidos: aumenta o estoque dos itens conforme as linhas.
 */
export const REGISTER_STOCK_ENTRY_INBOUND_PORT = Symbol(
  'RegisterStockEntryInboundPort',
);

export interface IRegisterStockEntryInboundPort {
  execute(dto: RegisterStockEntryDto): Promise<StockEntry>;
}
