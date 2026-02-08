import { Injectable } from '@nestjs/common';
import type { Item } from '../../../domain/entities/item';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../../domain/ports/item-repository.port';

/**
 * Repositório in-memory de Item para testes locais e desenvolvimento.
 * Implementa a porta de saída IItemRepositoryPort.
 */
@Injectable()
export class InMemoryItemRepository implements IItemRepositoryPort {
  private readonly store = new Map<string, Item>();

  async findById(id: string): Promise<Item | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: Item): Promise<Item> {
    this.store.set(entity.getId(), entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  /** Útil para testes: retorna todos os itens. */
  async findAll(): Promise<Item[]> {
    return Array.from(this.store.values());
  }

  async findByBarcode(barcode: string): Promise<Item | null> {
    const trimmed = barcode?.trim() ?? '';
    if (!trimmed) return null;
    for (const item of this.store.values()) {
      if (item.barcode === trimmed) return item;
    }
    return null;
  }

  /** Útil para testes: limpa o store. */
  clear(): void {
    this.store.clear();
  }
}
