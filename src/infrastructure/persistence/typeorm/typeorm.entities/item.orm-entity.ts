import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'items' })
export class ItemOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  // numeric -> string in JS, we convert in repositories
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'cost_price' })
  costPrice!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 60 })
  sku!: string;

  @Index()
  @Column({ type: 'varchar', length: 100, name: 'supplier_code', default: '' })
  supplierCode!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  barcode!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}

