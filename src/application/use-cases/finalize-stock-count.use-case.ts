import { Inject, Injectable } from '@nestjs/common';
import { StockCount } from '../../domain/entities/stock-count';
import { StockCountLine } from '../../domain/value-objects/stock-count-line';
import {
  STOCK_COUNT_REPOSITORY_PORT,
  type IStockCountRepositoryPort,
} from '../../domain/ports/stock-count-repository.port';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { IFinalizeStockCountInboundPort } from '../ports/inbound/finalize-stock-count.inbound-port';

/**
 * Caso de uso: Finalizar balanço e comparar quantidade contada com a do sistema.
 * Gera inventário completo:
 * - Todos os itens do estoque do sistema: countedQuantity = bipado se existir em lines, senão 0.
 * - Itens bipados que não existem no sistema: linha com systemQuantity = 0, variance = countedQuantity.
 * Para todas as linhas: variance = countedQuantity - systemQuantity.
 */
@Injectable()
export class FinalizeStockCountUseCase
  implements IFinalizeStockCountInboundPort
{
  constructor(
    @Inject(STOCK_COUNT_REPOSITORY_PORT)
    private readonly stockCountRepository: IStockCountRepositoryPort,
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(countId: string): Promise<StockCount | null> {
    const count = await this.stockCountRepository.findById(countId);
    if (!count || count.status !== 'IN_PROGRESS') {
      return null;
    }

    const countedByItemId = new Map<string, number>();
    for (const line of count.lines) {
      countedByItemId.set(line.itemId, line.countedQuantity);
    }

    const allItems = await this.itemRepository.findAll();
    const systemItemIds = new Set(allItems.map((i) => i.getId()));
    const finalizedLines: StockCountLine[] = [];

    for (const item of allItems) {
      const itemId = item.getId();
      const countedQuantity = countedByItemId.get(itemId) ?? 0;
      const systemQuantity = item.quantity;
      const variance = countedQuantity - systemQuantity;
      finalizedLines.push(
        new StockCountLine({
          itemId,
          countedQuantity,
          systemQuantity,
          variance,
        }),
      );

      countedByItemId.delete(itemId);
    }

    for (const [itemId, countedQuantity] of countedByItemId) {
      finalizedLines.push(
        new StockCountLine({
          itemId,
          countedQuantity,
          systemQuantity: 0,
          variance: countedQuantity,
        }),
      );
    }

    finalizedLines.sort((a, b) => a.itemId.localeCompare(b.itemId));

    const finalized = new StockCount(
      count.getId(),
      count.code,
      count.name,
      count.description,
      'FINALIZED',
      finalizedLines,
      count.createdAt,
      new Date(),
    );
    return this.stockCountRepository.save(finalized);
  }
}
