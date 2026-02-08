import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../../../../domain/entities/item';
import type { IItemRepositoryPort } from '../../../../domain/ports/item-repository.port';
import { ItemOrmEntity } from '../typeorm.entities/item.orm-entity';

@Injectable()
export class TypeOrmItemRepository implements IItemRepositoryPort {
  constructor(
    @InjectRepository(ItemOrmEntity)
    private readonly repo: Repository<ItemOrmEntity>,
  ) {}

  async findById(id: string): Promise<Item | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Item[]> {
    const rows = await this.repo.find();
    return rows.map((r) => this.toDomain(r));
  }

  async findByBarcode(barcode: string): Promise<Item | null> {
    const trimmed = barcode?.trim() ?? '';
    if (!trimmed) return null;
    const row = await this.repo.findOne({ where: { barcode: trimmed } });
    return row ? this.toDomain(row) : null;
  }

  async save(entity: Item): Promise<Item> {
    const row: ItemOrmEntity = {
      id: entity.getId(),
      name: entity.name,
      price: entity.price.toFixed(2),
      costPrice: entity.costPrice.toFixed(2),
      sku: entity.sku,
      supplierCode: entity.supplierCode,
      barcode: entity.barcode,
      quantity: entity.quantity,
      description: entity.description ?? '',
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    await this.repo.save(row);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  private toDomain(row: ItemOrmEntity): Item {
    return new Item(
      row.id,
      row.name,
      Number(row.price),
      Number(row.costPrice),
      row.sku,
      row.supplierCode,
      row.barcode,
      row.quantity,
      row.description ?? '',
      row.createdAt,
      row.updatedAt,
    );
  }
}

