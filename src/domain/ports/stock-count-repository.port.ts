import type { StockCount } from '../entities/stock-count';
import type { IRepositoryPort } from './repository.port';

export const STOCK_COUNT_REPOSITORY_PORT = Symbol('StockCountRepositoryPort');

export interface IStockCountRepositoryPort
  extends IRepositoryPort<StockCount, string> {
  findAll(): Promise<StockCount[]>;
}
