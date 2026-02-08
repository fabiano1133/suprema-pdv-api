import type { Item } from '../entities/item';
import type { IRepositoryPort } from './repository.port';

export const ITEM_REPOSITORY_PORT = Symbol('ItemRepositoryPort');

export interface IItemRepositoryPort extends IRepositoryPort<Item, string> {
  findAll(): Promise<Item[]>;
  /** Busca item pelo código de barras (para validar unicidade). */
  findByBarcode(barcode: string): Promise<Item | null>;
}
