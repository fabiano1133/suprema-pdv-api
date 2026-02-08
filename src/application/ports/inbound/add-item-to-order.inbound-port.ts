import type { Order } from '../../../domain/entities/order';
import type { AddItemToOrderDto } from '../../dto/add-item-to-order.dto';

/**
 * Porta de entrada (Inbound Port) - Adicionar item a uma comanda.
 * Só é possível adicionar em comanda aberta (OPEN).
 */
export const ADD_ITEM_TO_ORDER_INBOUND_PORT = Symbol('AddItemToOrderInboundPort');

export interface IAddItemToOrderInboundPort {
  /**
   * Adiciona o item à comanda (ou soma à quantidade se o item já existir na comanda).
   * @param orderId ID da comanda.
   * @param dto itemId e quantity.
   * @returns A comanda atualizada ou null se a comanda não existir.
   * @throws DomainValidationException se o item não existir, quantidade inválida ou comanda não estiver aberta.
   */
  execute(orderId: string, dto: AddItemToOrderDto): Promise<Order | null>;
}
