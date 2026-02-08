import { Inject, Injectable } from '@nestjs/common';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { IDeleteItemInboundPort } from '../ports/inbound/delete-item.inbound-port';

/**
 * Caso de uso: Excluir Item.
 * Retorna true se o item foi excluído, false se não existir.
 */
@Injectable()
export class DeleteItemUseCase implements IDeleteItemInboundPort {
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(id: string): Promise<boolean> {
    const item = await this.itemRepository.findById(id);
    if (!item) return false;

    await this.itemRepository.delete(id);
    return true;
  }
}
