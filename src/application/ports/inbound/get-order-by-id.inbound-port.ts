import type { Order } from '../../../domain/entities/order';

/**
 * Porta de entrada (Inbound Port) - Buscar comanda (Order) por ID.
 */
export const GET_ORDER_BY_ID_INBOUND_PORT = Symbol('GetOrderByIdInboundPort');

export interface IGetOrderByIdInboundPort {
  execute(id: string): Promise<Order | null>;
}
