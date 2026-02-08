import { Inject, Injectable } from '@nestjs/common';
import type { Order } from '../../domain/entities/order';
import { OrderLine } from '../../domain/value-objects/order-line';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepositoryPort,
} from '../../domain/ports/order-repository.port';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { IAddItemToOrderInboundPort } from '../ports/inbound/add-item-to-order.inbound-port';
import type { AddItemToOrderDto } from '../dto/add-item-to-order.dto';
import { DomainValidationException } from '../errors/domain-validation.exception';

/**
 * Caso de uso: Adicionar item a uma comanda.
 * Só é possível em comanda aberta (OPEN). Preço e nome do produto vêm do Item (snapshot na linha).
 */
@Injectable()
export class AddItemToOrderUseCase implements IAddItemToOrderInboundPort {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(orderId: string, dto: AddItemToOrderDto): Promise<Order | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      return null;
    }

    const item = await this.itemRepository.findById(dto.itemId);
    if (!item) {
      throw new DomainValidationException(
        `Não é possível adicionar: produto com id ${dto.itemId} não existe.`,
      );
    }

    const quantity = dto.quantity;
    if (quantity == null || quantity <= 0 || !Number.isInteger(quantity)) {
      throw new DomainValidationException(
        'A quantidade deve ser um número inteiro positivo.',
      );
    }

    try {
      const line = new OrderLine({
        itemId: item.getId(),
        quantity,
        unitPrice: item.price,
        productName: item.name,
      });
      order.addLine(line);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível adicionar o item.';
      throw new DomainValidationException(message);
    }

    return this.orderRepository.save(order);
  }
}
