import type { Item } from '../../../domain/entities/item';

/**
 * Porta de entrada (Inbound Port) - Buscar Item por ID.
 */
export const GET_ITEM_BY_ID_INBOUND_PORT = Symbol('GetItemByIdInboundPort');

export interface IGetItemByIdInboundPort {
  execute(id: string): Promise<Item | null>;
}
