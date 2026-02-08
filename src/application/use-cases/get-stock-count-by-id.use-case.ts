import { Inject, Injectable } from '@nestjs/common';
import type { StockCount } from '../../domain/entities/stock-count';
import {
  STOCK_COUNT_REPOSITORY_PORT,
  type IStockCountRepositoryPort,
} from '../../domain/ports/stock-count-repository.port';
import type { IGetStockCountByIdInboundPort } from '../ports/inbound/get-stock-count-by-id.inbound-port';

/**
 * Caso de uso: Buscar conferência/balanço por ID.
 */
@Injectable()
export class GetStockCountByIdUseCase
  implements IGetStockCountByIdInboundPort
{
  constructor(
    @Inject(STOCK_COUNT_REPOSITORY_PORT)
    private readonly stockCountRepository: IStockCountRepositoryPort,
  ) {}

  async execute(id: string): Promise<StockCount | null> {
    return this.stockCountRepository.findById(id);
  }
}
