import { Inject, Injectable } from '@nestjs/common';
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
import type { IUpdateStockEntryInboundPort } from '../ports/inbound/update-stock-entry.inbound-port';
import type { UpdateStockEntryDto } from '../dto/update-stock-entry.dto';
import { DomainValidationException } from '../errors/domain-validation.exception';

/**
 * Caso de uso: Atualizar entrada de estoque (pedido).
 * Referência e fornecedor: atualizados se enviados.
 * Linhas: se enviadas, reverte as quantidades antigas nos itens e aplica as novas (atualiza estoque).
 * Retorna null se a entrada não existir.
 */
@Injectable()
export class UpdateStockEntryUseCase implements IUpdateStockEntryInboundPort {
  constructor(
    @Inject(STOCK_ENTRY_REPOSITORY_PORT)
    private readonly stockEntryRepository: IStockEntryRepositoryPort,
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(id: string, dto: UpdateStockEntryDto): Promise<StockEntry | null> {
    const entry = await this.stockEntryRepository.findById(id);
    if (!entry) return null;

    let newLines = [...entry.lines];
    const hasNewLines = dto.lines != null && dto.lines.length > 0;

    if (hasNewLines) {
      // Reverte as quantidades antigas nos itens (estorno)
      for (const line of entry.lines) {
        const item = await this.itemRepository.findById(line.itemId);
        if (!item) {
          throw new DomainValidationException(
            `Produto com id ${line.itemId} não encontrado. Não é possível reverter a entrada.`,
          );
        }
        try {
          item.deductQuantity(line.quantity);
        } catch (e) {
          throw new DomainValidationException(
            `Estoque insuficiente para reverter a entrada do produto ${line.itemId}. ${e instanceof Error ? e.message : ''}`,
          );
        }
        await this.itemRepository.save(item);
      }

      // Valida e aplica as novas linhas nos itens (busca por barcode)
      const entryLines: StockEntryLine[] = [];
      const itemsToUpdate: Item[] = [];

      for (const line of dto.lines!) {
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

      newLines = entryLines;
    }

    const reference =
      dto.reference !== undefined ? dto.reference?.trim() : entry.reference;
    const supplier =
      dto.supplier !== undefined ? dto.supplier?.trim() : entry.supplier;

    const updated = new StockEntry(
      entry.getId(),
      reference,
      supplier,
      newLines,
      entry.createdAt,
    );

    return this.stockEntryRepository.save(updated);
  }
}
