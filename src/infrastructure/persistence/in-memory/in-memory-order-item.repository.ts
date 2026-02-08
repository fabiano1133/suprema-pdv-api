import { Injectable } from '@nestjs/common';
import type { OrderItem } from '../../../domain/entities/order-item';
import {
  ORDER_ITEM_REPOSITORY_PORT,
  type IOrderItemRepositoryPort,
} from '../../../domain/ports/order-item-repository.port';

/**
 * Repositório in-memory de OrderItem para testes locais e desenvolvimento.
 * Implementa a porta de saída IOrderItemRepositoryPort.
 */
@Injectable()
export class InMemoryOrderItemRepository implements IOrderItemRepositoryPort {
  private readonly store = new Map<string, OrderItem>();

  async findById(id: string): Promise<OrderItem | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: OrderItem): Promise<OrderItem> {
    this.store.set(entity.getId(), entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  /** Útil para testes: retorna todos os order items. */
  async findAll(): Promise<OrderItem[]> {
    return Array.from(this.store.values());
  }

  /** Útil para testes: retorna order items por orderId. */
  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.store.values()).filter(
      (oi) => oi.orderId === orderId,
    );
  }

  /** Útil para testes: limpa o store. */
  clear(): void {
    this.store.clear();
  }
}
