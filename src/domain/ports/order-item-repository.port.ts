import type { OrderItem } from '../entities/order-item';
import type { IRepositoryPort } from './repository.port';

export const ORDER_ITEM_REPOSITORY_PORT = Symbol('OrderItemRepositoryPort');

export type IOrderItemRepositoryPort = IRepositoryPort<OrderItem, string>;
