import type { StockEntry } from '../entities/stock-entry';
import type { IRepositoryPort } from './repository.port';

export const STOCK_ENTRY_REPOSITORY_PORT = Symbol('StockEntryRepositoryPort');

export interface IStockEntryRepositoryPort extends IRepositoryPort<StockEntry, string> {
  findAll(): Promise<StockEntry[]>;
}
