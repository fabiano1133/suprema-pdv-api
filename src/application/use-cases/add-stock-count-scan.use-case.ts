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
import type { IAddStockCountScanInboundPort } from '../ports/inbound/add-stock-count-scan.inbound-port';
import type { AddStockCountScanDto } from '../dto/add-stock-count-scan.dto';
import { DomainValidationException } from '../errors/domain-validation.exception';

/**
 * Caso de uso: Adicionar bipagem ao balanço (produto + quantidade contada).
 * Se o produto já foi bipado, a quantidade é somada.
 * Retorna null se o balanço não existir ou já estiver finalizado.
 */
@Injectable()
export class AddStockCountScanUseCase implements IAddStockCountScanInboundPort {
  constructor(
    @Inject(STOCK_COUNT_REPOSITORY_PORT)
    private readonly stockCountRepository: IStockCountRepositoryPort,
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(
    countId: string,
    dto: AddStockCountScanDto,
  ): Promise<StockCount | null> {
    const count = await this.stockCountRepository.findById(countId);
    if (!count || count.status !== 'IN_PROGRESS') {
      return null;
    }

    const item = await this.itemRepository.findById(dto.itemId);
    if (!item) {
      throw new DomainValidationException(
        `Produto com id ${dto.itemId} não encontrado no catálogo.`,
      );
    }

    const quantity =
      dto.quantity == null || dto.quantity < 0
        ? 0
        : Math.floor(dto.quantity);

    const existingIndex = count.lines.findIndex(
      (l) => l.itemId === dto.itemId.trim(),
    );
    const currentCounted =
      existingIndex >= 0 ? count.lines[existingIndex].countedQuantity : 0;
    const newCounted = currentCounted + quantity;

    const newLines = [...count.lines];
    const newLine = new StockCountLine({
      itemId: dto.itemId.trim(),
      countedQuantity: newCounted,
    });
    if (existingIndex >= 0) {
      newLines[existingIndex] = newLine;
    } else {
      newLines.push(newLine);
    }

    const updated = new StockCount(
      count.getId(),
      count.code,
      count.name,
      count.description,
      'IN_PROGRESS',
      newLines,
      count.createdAt,
    );
    return this.stockCountRepository.save(updated);
  }
}
