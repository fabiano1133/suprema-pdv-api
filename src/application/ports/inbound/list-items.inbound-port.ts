import type { Item } from '../../../domain/entities/item';
import type { ListItemsDto } from '../../dto/list-items.dto';
import type { PaginatedResultDto } from '../../dto/paginated-result.dto';

/**
 * Porta de entrada (Inbound Port) - Listar Items com paginação.
 */
export const LIST_ITEMS_INBOUND_PORT = Symbol('ListItemsInboundPort');

export interface IListItemsInboundPort {
  execute(filters?: ListItemsDto): Promise<PaginatedResultDto<Item>>;
}
