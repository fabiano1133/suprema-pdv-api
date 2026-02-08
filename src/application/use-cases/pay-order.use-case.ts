import { Inject, Injectable } from '@nestjs/common';
import type { Order, PaymentMethod } from '../../domain/entities/order';
import type { Item } from '../../domain/entities/item';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepositoryPort,
} from '../../domain/ports/order-repository.port';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { IPayOrderInboundPort } from '../ports/inbound/pay-order.inbound-port';
import { DomainValidationException } from '../errors/domain-validation.exception';

/**
 * Caso de uso: Fechar comanda (marcar como paga).
 * Só conclui se a comanda tiver ao menos um produto.
 * Ao fechar, dá baixa no estoque de cada produto (quantidade vendida é subtraída).
 */
@Injectable()
export class PayOrderUseCase implements IPayOrderInboundPort {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(id: string, paymentMethod: PaymentMethod): Promise<Order | null> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      return null;
    }

    if (order.lines.length === 0) {
      throw new DomainValidationException(
        'Não é possível fechar a comanda: é necessário ao menos um produto.',
      );
    }

    // Valida estoque de todos os produtos (sem alterar nada ainda)
    const itemsByItemId = new Map<string, Item>();
    for (const line of order.lines) {
      const item = await this.itemRepository.findById(line.itemId);
      if (!item) {
        throw new DomainValidationException(
          `Produto com id ${line.itemId} não encontrado no catálogo. Não é possível fechar a comanda.`,
        );
      }
      if (item.quantity < line.quantity) {
        throw new DomainValidationException(
          `Estoque insuficiente para o produto "${item.name}" (id: ${line.itemId}). Disponível: ${item.quantity}, solicitado: ${line.quantity}.`,
        );
      }
      itemsByItemId.set(line.itemId, item);
    }

    // Saída de estoque: toda venda subtrai a quantidade vendida (deductQuantity já validou acima)
    for (const line of order.lines) {
      const item = itemsByItemId.get(line.itemId)!;
      item.deductQuantity(line.quantity);
      await this.itemRepository.save(item);
    }

    order.pay(paymentMethod);
    return this.orderRepository.save(order);
  }
}
