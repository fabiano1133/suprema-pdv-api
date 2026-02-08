import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockCount } from '../../../../domain/entities/stock-count';
import { StockCountLine } from '../../../../domain/value-objects/stock-count-line';
import type { IStockCountRepositoryPort } from '../../../../domain/ports/stock-count-repository.port';
import {
  StockCountOrmEntity,
  type StockCountLineOrm,
} from '../typeorm.entities/stock-count.orm-entity';

@Injectable()
export class TypeOrmStockCountRepository implements IStockCountRepositoryPort {
  constructor(
    @InjectRepository(StockCountOrmEntity)
    private readonly repo: Repository<StockCountOrmEntity>,
  ) {}

  async findById(id: string): Promise<StockCount | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<StockCount[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map((r) => this.toDomain(r));
  }

  async save(entity: StockCount): Promise<StockCount> {
    const lines: StockCountLineOrm[] = entity.lines.map((l) => ({
      itemId: l.itemId,
      countedQuantity: l.countedQuantity,
      ...(l.systemQuantity !== undefined && { systemQuantity: l.systemQuantity }),
      ...(l.variance !== undefined && { variance: l.variance }),
    }));

    const row: StockCountOrmEntity = {
      id: entity.getId(),
      code: entity.code,
      name: entity.name,
      description: entity.description ?? '',
      status: entity.status,
      lines,
      createdAt: entity.createdAt,
      finalizedAt: entity.finalizedAt ?? null,
    };
    await this.repo.save(row);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  private toDomain(row: StockCountOrmEntity): StockCount {
    const lines = (row.lines ?? []).map(
      (l) =>
        new StockCountLine({
          itemId: l.itemId,
          countedQuantity: l.countedQuantity,
          ...(l.systemQuantity !== undefined && { systemQuantity: l.systemQuantity }),
          ...(l.variance !== undefined && { variance: l.variance }),
        }),
    );

    return new StockCount(
      row.id,
      row.code,
      row.name,
      row.description ?? '',
      row.status as any,
      lines,
      row.createdAt,
      row.finalizedAt ?? undefined,
    );
  }
}

