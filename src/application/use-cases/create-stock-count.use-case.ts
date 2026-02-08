import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StockCount } from '../../domain/entities/stock-count';
import {
  STOCK_COUNT_REPOSITORY_PORT,
  type IStockCountRepositoryPort,
} from '../../domain/ports/stock-count-repository.port';
import type { ICreateStockCountInboundPort } from '../ports/inbound/create-stock-count.inbound-port';
import type { CreateStockCountDto } from '../dto/create-stock-count.dto';

const CODE_PREFIX = 'BAL-';
const CODE_PADDING = 3;

/**
 * Caso de uso: Iniciar nova conferência/balanço.
 * Balanço inicia vazio (status IN_PROGRESS); o usuário bipa os produtos e depois finaliza.
 * Código interno (BAL-001, BAL-002, ...) é gerado automaticamente.
 */
@Injectable()
export class CreateStockCountUseCase implements ICreateStockCountInboundPort {
  constructor(
    @Inject(STOCK_COUNT_REPOSITORY_PORT)
    private readonly stockCountRepository: IStockCountRepositoryPort,
  ) {}

  async execute(dto: CreateStockCountDto): Promise<StockCount> {
    const code = await this.nextCode();
    const id = randomUUID();
    const name = (dto.name ?? '').trim();
    const description = (dto.description ?? '').trim();
    const count = new StockCount(
      id,
      code,
      name,
      description,
      'IN_PROGRESS',
      [],
      new Date(),
    );
    return this.stockCountRepository.save(count);
  }

  private async nextCode(): Promise<string> {
    const all = await this.stockCountRepository.findAll();
    const numbers = all
      .map((c) => {
        const match = c.code.match(/^BAL-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);
    const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `${CODE_PREFIX}${String(next).padStart(CODE_PADDING, '0')}`;
  }
}
