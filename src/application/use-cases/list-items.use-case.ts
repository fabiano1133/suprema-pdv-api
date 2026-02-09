import { Inject, Injectable } from '@nestjs/common';
import type { Item } from '../../domain/entities/item';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { IListItemsInboundPort } from '../ports/inbound/list-items.inbound-port';
import type { ListItemsDto } from '../dto/list-items.dto';
import type { PaginatedResultDto } from '../dto/paginated-result.dto';
import { buildPaginationMeta } from '../dto/paginated-result.dto';
import {
  LIST_ITEMS_DEFAULT_LIMIT,
  LIST_ITEMS_DEFAULT_PAGE,
  LIST_ITEMS_MAX_LIMIT,
} from '../dto/list-items.dto';

/**
 * Caso de uso: Listar Items (produtos do catálogo) com paginação.
 */
@Injectable()
export class ListItemsUseCase implements IListItemsInboundPort {
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(
    filters?: ListItemsDto,
  ): Promise<PaginatedResultDto<Item>> {
    const allItems = await this.itemRepository.findAll();

    const term = (filters?.search ?? '').trim().toLowerCase();
    const filteredItems =
      term.length > 0
        ? allItems.filter((item) => {
            const barcode = (item.barcode ?? '').toLowerCase();
            const name = (item.name ?? '').toLowerCase();
            return barcode.includes(term) || name.includes(term);
          })
        : allItems;

    const total = filteredItems.length;

    // Special case: ?page=null -> return all items (no pagination)
    if (filters?.page === null) {
      const meta = buildPaginationMeta(total, 1, Math.max(1, total));
      return { data: filteredItems, meta };
    }

    const page = Math.max(1, filters?.page ?? LIST_ITEMS_DEFAULT_PAGE);
    const limit = Math.min(
      LIST_ITEMS_MAX_LIMIT,
      Math.max(1, filters?.limit ?? LIST_ITEMS_DEFAULT_LIMIT),
    );
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * limit;
    const data = filteredItems.slice(skip, skip + limit);

    const meta = buildPaginationMeta(total, currentPage, limit);

    return { data, meta };
  }
}
