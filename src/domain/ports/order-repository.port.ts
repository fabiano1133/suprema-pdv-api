import type { Order } from '../entities/order';
import type { IRepositoryPort } from './repository.port';

export const ORDER_REPOSITORY_PORT = Symbol('OrderRepositoryPort');

export interface IOrderRepositoryPort extends IRepositoryPort<Order, string> {
  /** Retorna o próximo código da comanda (ex.: COM-0001, COM-0002). */
  getNextComNumber(): Promise<string>;
  /** Retorna todas as comandas. */
  findAll(): Promise<Order[]>;
}
