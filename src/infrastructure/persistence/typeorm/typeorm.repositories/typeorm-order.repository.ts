import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaymentMethod } from '../../../../domain/entities/order';
import { Order } from '../../../../domain/entities/order';
import { OrderLine } from '../../../../domain/value-objects/order-line';
import type { IOrderRepositoryPort } from '../../../../domain/ports/order-repository.port';
import { OrderOrmEntity, type OrderLineOrm } from '../typeorm.entities/order.orm-entity';

@Injectable()
export class TypeOrmOrderRepository implements IOrderRepositoryPort {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repo: Repository<OrderOrmEntity>,
  ) {}

  async getNextComNumber(): Promise<string> {
    // MVP: derive from max existing COM-XXXX. (Note: not safe under high concurrency.)
    const rows: Array<{ max: string | null }> = await this.repo.query(
      `SELECT MAX(CAST(SUBSTRING(com_number, 5) AS INT))::text AS max
       FROM orders
       WHERE com_number LIKE 'COM-%'`,
    );
    const max = rows?.[0]?.max ? parseInt(rows[0].max, 10) : 0;
    const next = Number.isFinite(max) ? max + 1 : 1;
    return `COM-${String(next).padStart(4, '0')}`;
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Order[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' as any } });
    return rows.map((r) => this.toDomain(r));
  }

  async save(entity: Order): Promise<Order> {
    const lines: OrderLineOrm[] = entity.lines.map((l) => ({
      itemId: l.itemId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      productName: l.productName,
    }));

    const row: OrderOrmEntity = {
      id: entity.getId(),
      status: entity.status,
      total: entity.total.toFixed(2),
      comNumber: entity.comNumber,
      client: entity.client ?? null,
      paymentMethod: entity.paymentMethod ?? null,
      lines,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    await this.repo.save(row);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  private toDomain(row: OrderOrmEntity): Order {
    const lines = (row.lines ?? []).map(
      (l) =>
        new OrderLine({
          itemId: l.itemId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          productName: l.productName,
        }),
    );
    return new Order(
      row.id,
      row.status as any,
      Number(row.total),
      row.comNumber,
      row.createdAt,
      row.updatedAt,
      lines,
      row.client ?? undefined,
      (row.paymentMethod as PaymentMethod) ?? null,
    );
  }
}

