import { Inject, Injectable } from '@nestjs/common';
import type { Item } from '../../domain/entities/item';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { IGetItemByIdInboundPort } from '../ports/inbound/get-item-by-id.inbound-port';

/**
 * Caso de uso: Buscar um Item por ID.
 */
@Injectable()
export class GetItemByIdUseCase implements IGetItemByIdInboundPort {
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(id: string): Promise<Item | null> {
    return this.itemRepository.findById(id);
  }
}
