import type { StockCount } from '../../../domain/entities/stock-count';
import type { AddStockCountScanDto } from '../../dto/add-stock-count-scan.dto';

/**
 * Porta de entrada: Adicionar bipagem ao balanço (produto + quantidade contada).
 */
export const ADD_STOCK_COUNT_SCAN_INBOUND_PORT = Symbol(
  'AddStockCountScanInboundPort',
);

export interface IAddStockCountScanInboundPort {
  execute(countId: string, dto: AddStockCountScanDto): Promise<StockCount | null>;
}
