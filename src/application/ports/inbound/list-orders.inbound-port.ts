import type { Order } from '../../../domain/entities/order';
import type { ListOrdersDto } from '../../dto/list-orders.dto';
import type { PaginatedResultDto } from '../../dto/paginated-result.dto';

/**
 * Porta de entrada (Inbound Port) - Listar comandas com filtros e paginação.
 */
export const LIST_ORDERS_INBOUND_PORT = Symbol('ListOrdersInboundPort');

export interface IListOrdersInboundPort {
  execute(filters?: ListOrdersDto): Promise<PaginatedResultDto<Order>>;
}
