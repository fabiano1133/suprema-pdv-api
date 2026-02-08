import { Inject, Injectable } from '@nestjs/common';
import type { Order } from '../../domain/entities/order';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepositoryPort,
} from '../../domain/ports/order-repository.port';
import type { IGetOrderByIdInboundPort } from '../ports/inbound/get-order-by-id.inbound-port';

/**
 * Caso de uso: Buscar uma comanda (Order) por ID.
 */
@Injectable()
export class GetOrderByIdUseCase implements IGetOrderByIdInboundPort {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
  ) {}

  async execute(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }
}
