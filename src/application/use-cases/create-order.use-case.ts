import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Order } from '../../domain/entities/order';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepositoryPort,
} from '../../domain/ports/order-repository.port';
import type { ICreateOrderInboundPort } from '../ports/inbound/create-order.inbound-port';
import type { CreateOrderDto } from '../dto/create-order.dto';

/**
 * Caso de uso: Criar Order (abrir venda).
 * Cria uma venda vazia com status OPEN e total 0.
 */
@Injectable()
export class CreateOrderUseCase implements ICreateOrderInboundPort {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
  ) {}

  async execute(input?: CreateOrderDto): Promise<Order> {
    const id = randomUUID();
    const comNumber = await this.orderRepository.getNextComNumber();
    const order = new Order(id, 'OPEN', 0, comNumber, new Date(), new Date(), undefined, input?.client);
    return this.orderRepository.save(order);
  }
}
