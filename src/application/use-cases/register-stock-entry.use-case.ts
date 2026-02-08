import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StockEntry } from '../../domain/entities/stock-entry';
import type { Item } from '../../domain/entities/item';
import { StockEntryLine } from '../../domain/value-objects/stock-entry-line';
import {
  STOCK_ENTRY_REPOSITORY_PORT,
  type IStockEntryRepositoryPort,
} from '../../domain/ports/stock-entry-repository.port';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { IRegisterStockEntryInboundPort } from '../ports/inbound/register-stock-entry.inbound-port';
import type { RegisterStockEntryDto } from '../dto/register-stock-entry.dto';
import { DomainValidationException } from '../errors/domain-validation.exception';

/**
 * Caso de uso: Registrar entrada de estoque (nota/pedido).
 * Cria o documento de entrada e soma as quantidades ao estoque dos itens.
 * Estoque só deve ser alimentado por este fluxo (não mais pelo cadastro do produto).
 */
@Injectable()
export class RegisterStockEntryUseCase implements IRegisterStockEntryInboundPort {
  constructor(
    @Inject(STOCK_ENTRY_REPOSITORY_PORT)
    private readonly stockEntryRepository: IStockEntryRepositoryPort,
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(dto: RegisterStockEntryDto): Promise<StockEntry> {
    if (!dto.lines?.length) {
      throw new DomainValidationException(
        'É necessário ao menos uma linha na entrada de estoque (barcode ou itemId e quantidade).',
      );
    }

    const entryLines: StockEntryLine[] = [];
    const itemsToUpdate: Item[] = [];

    for (const line of dto.lines) {
      const barcode = (line.barcode ?? '').trim();
      const itemId = (line.itemId ?? '').trim();
      if (!barcode && !itemId) {
        throw new DomainValidationException(
          'Informe barcode ou itemId na linha da entrada de estoque.',
        );
      }
      const item = barcode
        ? await this.itemRepository.findByBarcode(barcode)
        : await this.itemRepository.findById(itemId);
      if (!item) {
        throw new DomainValidationException(
          barcode
            ? `Produto com código de barras "${barcode}" não encontrado no catálogo.`
            : `Produto com id ${itemId} não encontrado no catálogo.`,
        );
      }
      if (
        line.quantity == null ||
        line.quantity < 1 ||
        !Number.isInteger(line.quantity)
      ) {
        const ref = barcode || itemId;
        throw new DomainValidationException(
          `Quantidade deve ser um número inteiro positivo. Item ${ref}: ${line.quantity}.`,
        );
      }

      entryLines.push(
        new StockEntryLine({ itemId: item.getId(), quantity: line.quantity }),
      );
      itemsToUpdate.push(item);
    }

    // Aplica entrada no estoque de cada item
    for (let i = 0; i < entryLines.length; i++) {
      const line = entryLines[i];
      const item = itemsToUpdate[i];
      try {
        item.addQuantity(line.quantity);
      } catch (e) {
        throw new DomainValidationException(
          e instanceof Error ? e.message : 'Erro ao dar entrada no estoque',
        );
      }
      await this.itemRepository.save(item);
    }

    const id = randomUUID();
    const entry = new StockEntry(
      id,
      dto.reference?.trim(),
      dto.supplier?.trim(),
      entryLines,
      new Date(),
    );

    return this.stockEntryRepository.save(entry);
  }
}
