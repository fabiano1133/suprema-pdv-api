import type { Order } from '../../../domain/entities/order';

/**
 * Porta de entrada (Inbound Port) - Remover produto de uma comanda.
 * Só é possível em comanda com status OPEN (não pode remover de comanda paga).
 */
export const REMOVE_ITEM_FROM_ORDER_INBOUND_PORT =
  Symbol('RemoveItemFromOrderInboundPort');

export interface IRemoveItemFromOrderInboundPort {
  /**
   * Remove o produto da comanda.
   * @param orderId ID da comanda.
   * @param itemId ID do produto (item) a remover.
   * @returns A comanda atualizada ou null se a comanda não existir.
   * @throws DomainValidationException se a comanda não estiver OPEN ou o produto não estiver na comanda.
   */
  execute(orderId: string, itemId: string): Promise<Order | null>;
}
