import { Inject, Injectable } from '@nestjs/common';
import type { StockEntry } from '../../domain/entities/stock-entry';
import {
  STOCK_ENTRY_REPOSITORY_PORT,
  type IStockEntryRepositoryPort,
} from '../../domain/ports/stock-entry-repository.port';
import type { IGetStockEntryByIdInboundPort } from '../ports/inbound/get-stock-entry-by-id.inbound-port';

/**
 * Caso de uso: Buscar entrada de estoque (pedido) por ID.
 */
@Injectable()
export class GetStockEntryByIdUseCase implements IGetStockEntryByIdInboundPort {
  constructor(
    @Inject(STOCK_ENTRY_REPOSITORY_PORT)
    private readonly stockEntryRepository: IStockEntryRepositoryPort,
  ) {}

  async execute(id: string): Promise<StockEntry | null> {
    return this.stockEntryRepository.findById(id);
  }
}
