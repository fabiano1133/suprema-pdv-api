import type { Order } from '../../../domain/entities/order';
import type { PaymentMethod } from '../../../domain/entities/order';

/**
 * Porta de entrada (Inbound Port) - Fechar comanda (marcar como paga).
 * Só conclui se a comanda tiver ao menos um produto e paymentMethod informado.
 */
export const PAY_ORDER_INBOUND_PORT = Symbol('PayOrderInboundPort');

export interface IPayOrderInboundPort {
  /**
   * Marca a comanda como paga com a forma de pagamento informada.
   * @returns A comanda atualizada ou null se não existir.
   * @throws DomainValidationException se a comanda não tiver ao menos um produto.
   */
  execute(id: string, paymentMethod: PaymentMethod): Promise<Order | null>;
}
