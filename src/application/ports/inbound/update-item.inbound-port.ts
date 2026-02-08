import type { Item } from '../../../domain/entities/item';
import type { UpdateItemDto } from '../../dto/update-item.dto';

/**
 * Porta de entrada (Inbound Port) - Atualizar Item.
 */
export const UPDATE_ITEM_INBOUND_PORT = Symbol('UpdateItemInboundPort');

export interface IUpdateItemInboundPort {
  execute(id: string, input: UpdateItemDto): Promise<Item | null>;
}
