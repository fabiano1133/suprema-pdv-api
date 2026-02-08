import { Injectable } from '@nestjs/common';
import type { Order } from '../../../domain/entities/order';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepositoryPort,
} from '../../../domain/ports/order-repository.port';

/**
 * Repositório in-memory de Order para testes locais e desenvolvimento.
 * Implementa a porta de saída IOrderRepositoryPort.
 * Mantém contador para getNextComNumber (COM-0001, COM-0002, ...).
 */
@Injectable()
export class InMemoryOrderRepository implements IOrderRepositoryPort {
  private readonly store = new Map<string, Order>();
  private sequenceCounter = 0;

  async getNextComNumber(): Promise<string> {
    this.sequenceCounter += 1;
    return `COM-${String(this.sequenceCounter).padStart(4, '0')}`;
  }

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: Order): Promise<Order> {
    this.store.set(entity.getId(), entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  /** Útil para testes: retorna todas as orders. */
  async findAll(): Promise<Order[]> {
    return Array.from(this.store.values());
  }

  /** Útil para testes: limpa o store (contador não é resetado). */
  clear(): void {
    this.store.clear();
  }
}
