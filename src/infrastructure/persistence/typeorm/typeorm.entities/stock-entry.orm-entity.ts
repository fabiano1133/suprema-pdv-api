import { Column, Entity, PrimaryColumn } from 'typeorm';

export interface StockEntryLineOrm {
  itemId: string;
  quantity: number;
}

@Entity({ name: 'stock_entries' })
export class StockEntryOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  supplier!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  lines!: StockEntryLineOrm[];

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}

