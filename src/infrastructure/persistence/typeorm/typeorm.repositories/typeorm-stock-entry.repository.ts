import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockEntry } from '../../../../domain/entities/stock-entry';
import { StockEntryLine } from '../../../../domain/value-objects/stock-entry-line';
import type { IStockEntryRepositoryPort } from '../../../../domain/ports/stock-entry-repository.port';
import {
  StockEntryOrmEntity,
  type StockEntryLineOrm,
} from '../typeorm.entities/stock-entry.orm-entity';

@Injectable()
export class TypeOrmStockEntryRepository implements IStockEntryRepositoryPort {
  constructor(
    @InjectRepository(StockEntryOrmEntity)
    private readonly repo: Repository<StockEntryOrmEntity>,
  ) {}

  async findById(id: string): Promise<StockEntry | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<StockEntry[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map((r) => this.toDomain(r));
  }

  async save(entity: StockEntry): Promise<StockEntry> {
    const lines: StockEntryLineOrm[] = entity.lines.map((l) => ({
      itemId: l.itemId,
      quantity: l.quantity,
    }));
    const row: StockEntryOrmEntity = {
      id: entity.getId(),
      reference: entity.reference ?? null,
      supplier: entity.supplier ?? null,
      lines,
      createdAt: entity.createdAt,
    };
    await this.repo.save(row);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  private toDomain(row: StockEntryOrmEntity): StockEntry {
    const lines = (row.lines ?? []).map(
      (l) => new StockEntryLine({ itemId: l.itemId, quantity: l.quantity }),
    );
    return new StockEntry(
      row.id,
      row.reference ?? undefined,
      row.supplier ?? undefined,
      lines,
      row.createdAt,
    );
  }
}

