import type { Order } from '../../../domain/entities/order';
import type { CreateOrderDto } from '../../dto/create-order.dto';

/**
 * Porta de entrada (Inbound Port) - Criar Order (abrir venda).
 */
export const CREATE_ORDER_INBOUND_PORT = Symbol('CreateOrderInboundPort');

export interface ICreateOrderInboundPort {
  execute(input?: CreateOrderDto): Promise<Order>;
}
