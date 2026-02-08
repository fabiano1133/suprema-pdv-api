import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export interface StockCountLineOrm {
  itemId: string;
  countedQuantity: number;
  systemQuantity?: number;
  variance?: number;
}

@Entity({ name: 'stock_counts' })
export class StockCountOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  description!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  lines!: StockCountLineOrm[];

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'finalized_at', nullable: true })
  finalizedAt!: Date | null;
}

