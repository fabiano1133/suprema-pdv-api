import { Inject, Injectable } from '@nestjs/common';
import type { StockEntry } from '../../domain/entities/stock-entry';
import {
  STOCK_ENTRY_REPOSITORY_PORT,
  type IStockEntryRepositoryPort,
} from '../../domain/ports/stock-entry-repository.port';
import type { IListStockEntriesInboundPort } from '../ports/inbound/list-stock-entries.inbound-port';

/**
 * Caso de uso: Listar entradas de estoque (histórico/auditoria).
 */
@Injectable()
export class ListStockEntriesUseCase implements IListStockEntriesInboundPort {
  constructor(
    @Inject(STOCK_ENTRY_REPOSITORY_PORT)
    private readonly stockEntryRepository: IStockEntryRepositoryPort,
  ) {}

  async execute(): Promise<StockEntry[]> {
    return this.stockEntryRepository.findAll();
  }
}
