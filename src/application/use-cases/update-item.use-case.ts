import { Inject, Injectable } from '@nestjs/common';
import type { Item } from '../../domain/entities/item';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { IUpdateItemInboundPort } from '../ports/inbound/update-item.inbound-port';
import type { UpdateItemDto } from '../dto/update-item.dto';
import { DomainValidationException } from '../errors/domain-validation.exception';

/**
 * Caso de uso: Atualizar Item (atualização parcial).
 * Retorna null se o item não existir; validações de domínio lançam DomainValidationException.
 */
@Injectable()
export class UpdateItemUseCase implements IUpdateItemInboundPort {
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateItemDto): Promise<Item | null> {
    const item = await this.itemRepository.findById(id);
    if (!item) return null;

    this.applyUpdates(item, input);
    return this.itemRepository.save(item);
  }

  private applyUpdates(item: Item, input: UpdateItemDto): void {
    if (input.name !== undefined) {
      try {
        item.updateName(input.name);
      } catch (e) {
        throw new DomainValidationException(
          e instanceof Error ? e.message : 'Name is invalid',
        );
      }
    }
    if (input.supplierCode !== undefined) {
      try {
        item.updateSupplierCode(input.supplierCode);
      } catch (e) {
        throw new DomainValidationException(
          e instanceof Error ? e.message : 'Supplier code is invalid',
        );
      }
    }
    if (input.price !== undefined) {
      try {
        item.updatePrice(input.price);
      } catch (e) {
        throw new DomainValidationException(
          e instanceof Error ? e.message : 'Price is invalid',
        );
      }
    }
    if (input.costPrice !== undefined) {
      try {
        item.updateCostPrice(input.costPrice);
      } catch (e) {
        throw new DomainValidationException(
          e instanceof Error ? e.message : 'Cost price is invalid',
        );
      }
    }
    if (input.description !== undefined) {
      item.updateDescription(input.description);
    }
  }
}
