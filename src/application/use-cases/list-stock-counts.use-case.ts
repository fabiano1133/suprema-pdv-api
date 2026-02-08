import { Inject, Injectable } from '@nestjs/common';
import type { StockCount } from '../../domain/entities/stock-count';
import {
  STOCK_COUNT_REPOSITORY_PORT,
  type IStockCountRepositoryPort,
} from '../../domain/ports/stock-count-repository.port';
import type { IListStockCountsInboundPort } from '../ports/inbound/list-stock-counts.inbound-port';

/**
 * Caso de uso: Listar conferências/balanços (histórico).
 */
@Injectable()
export class ListStockCountsUseCase implements IListStockCountsInboundPort {
  constructor(
    @Inject(STOCK_COUNT_REPOSITORY_PORT)
    private readonly stockCountRepository: IStockCountRepositoryPort,
  ) {}

  async execute(): Promise<StockCount[]> {
    return this.stockCountRepository.findAll();
  }
}
