import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export interface OrderLineOrm {
  itemId: string;
  quantity: number;
  unitPrice: number;
  productName?: string;
}

@Entity({ name: 'orders' })
export class OrderOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  status!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20, name: 'com_number' })
  comNumber!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  client!: string | null;

  @Column({ type: 'varchar', length: 20, name: 'payment_method', nullable: true })
  paymentMethod!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  lines!: OrderLineOrm[];

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}

