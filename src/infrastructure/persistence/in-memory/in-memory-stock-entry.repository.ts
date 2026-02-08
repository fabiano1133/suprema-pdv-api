import { Injectable } from '@nestjs/common';
import type { StockEntry } from '../../../domain/entities/stock-entry';
import {
  STOCK_ENTRY_REPOSITORY_PORT,
  type IStockEntryRepositoryPort,
} from '../../../domain/ports/stock-entry-repository.port';

/**
 * Repositório in-memory de StockEntry para desenvolvimento e testes.
 * Mantém histórico de entradas de estoque (auditoria).
 */
@Injectable()
export class InMemoryStockEntryRepository implements IStockEntryRepositoryPort {
  private readonly store = new Map<string, StockEntry>();

  async findById(id: string): Promise<StockEntry | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: StockEntry): Promise<StockEntry> {
    this.store.set(entity.getId(), entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async findAll(): Promise<StockEntry[]> {
    return Array.from(this.store.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }
}
