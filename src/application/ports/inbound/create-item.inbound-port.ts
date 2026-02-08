import type { Item } from '../../../domain/entities/item';
import type { CreateItemDto } from '../../dto/create-item.dto';

/**
 * Porta de entrada (Inbound Port) - Criar Item.
 */
export const CREATE_ITEM_INBOUND_PORT = Symbol('CreateItemInboundPort');

export interface ICreateItemInboundPort {
  execute(input: CreateItemDto): Promise<Item>;
}
