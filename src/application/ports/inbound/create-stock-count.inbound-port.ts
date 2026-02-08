import type { StockCount } from '../../../domain/entities/stock-count';
import type { CreateStockCountDto } from '../../dto/create-stock-count.dto';

/**
 * Porta de entrada: Iniciar nova conferência/balanço.
 */
export const CREATE_STOCK_COUNT_INBOUND_PORT = Symbol(
  'CreateStockCountInboundPort',
);

export interface ICreateStockCountInboundPort {
  execute(dto: CreateStockCountDto): Promise<StockCount>;
}
