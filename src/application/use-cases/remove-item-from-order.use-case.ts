import { Inject, Injectable } from '@nestjs/common';
import type { Order } from '../../domain/entities/order';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepositoryPort,
} from '../../domain/ports/order-repository.port';
import type { IRemoveItemFromOrderInboundPort } from '../ports/inbound/remove-item-from-order.inbound-port';
import { DomainValidationException } from '../errors/domain-validation.exception';

/**
 * Caso de uso: Remover produto de uma comanda.
 * Só é possível em comanda com status OPEN (não pode remover de comanda paga).
 */
@Injectable()
export class RemoveItemFromOrderUseCase implements IRemoveItemFromOrderInboundPort {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
  ) {}

  async execute(orderId: string, itemId: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return null;
    }

    try {
      order.removeLine(itemId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível remover o produto.';
      if (message.toLowerCase().includes('not open')) {
        throw new DomainValidationException(
          'Não é possível remover produto de uma comanda já paga. Apenas comandas abertas podem ser editadas.',
        );
      }
      if (message.toLowerCase().includes('not found')) {
        throw new DomainValidationException(
          'Produto não encontrado nesta comanda.',
        );
      }
      throw new DomainValidationException(message);
    }

    return this.orderRepository.save(order);
  }
}
