import { Injectable } from '@nestjs/common';
import type { StockCount } from '../../../domain/entities/stock-count';
import {
  STOCK_COUNT_REPOSITORY_PORT,
  type IStockCountRepositoryPort,
} from '../../../domain/ports/stock-count-repository.port';

/**
 * Repositório in-memory de StockCount (conferência/balanço).
 */
@Injectable()
export class InMemoryStockCountRepository implements IStockCountRepositoryPort {
  private readonly store = new Map<string, StockCount>();

  async findById(id: string): Promise<StockCount | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: StockCount): Promise<StockCount> {
    this.store.set(entity.getId(), entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async findAll(): Promise<StockCount[]> {
    return Array.from(this.store.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }
}
