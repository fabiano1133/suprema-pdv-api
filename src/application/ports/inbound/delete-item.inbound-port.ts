/**
 * Porta de entrada (Inbound Port) - Excluir Item.
 */
export const DELETE_ITEM_INBOUND_PORT = Symbol('DeleteItemInboundPort');

export interface IDeleteItemInboundPort {
  execute(id: string): Promise<boolean>;
}
