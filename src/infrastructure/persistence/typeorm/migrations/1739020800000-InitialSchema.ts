import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1739020800000 implements MigrationInterface {
  name = 'InitialSchema1739020800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "items" (
        "id" uuid NOT NULL,
        "name" character varying(200) NOT NULL,
        "price" numeric(12,2) NOT NULL,
        "cost_price" numeric(12,2) NOT NULL,
        "sku" character varying(60) NOT NULL,
        "supplier_code" character varying(100) NOT NULL DEFAULT '',
        "barcode" character varying(80) NOT NULL,
        "quantity" integer NOT NULL DEFAULT 0,
        "description" text NOT NULL DEFAULT '',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_items_sku" ON "items" ("sku")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_items_supplier_code" ON "items" ("supplier_code")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_items_barcode" ON "items" ("barcode")`,
    );

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL,
        "status" character varying(20) NOT NULL,
        "total" numeric(14,2) NOT NULL,
        "com_number" character varying(20) NOT NULL,
        "client" character varying(200),
        "lines" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_orders_com_number" ON "orders" ("com_number")`,
    );

    await queryRunner.query(`
      CREATE TABLE "stock_entries" (
        "id" uuid NOT NULL,
        "reference" character varying(100),
        "supplier" character varying(200),
        "lines" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_stock_entries" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "stock_counts" (
        "id" uuid NOT NULL,
        "code" character varying(20) NOT NULL,
        "name" character varying(200) NOT NULL,
        "description" character varying(500) NOT NULL DEFAULT '',
        "status" character varying(20) NOT NULL,
        "lines" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "finalized_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_stock_counts" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_stock_counts_code" ON "stock_counts" ("code")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_stock_counts_code"`);
    await queryRunner.query(`DROP TABLE "stock_counts"`);
    await queryRunner.query(`DROP TABLE "stock_entries"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_com_number"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP INDEX "IDX_items_barcode"`);
    await queryRunner.query(`DROP INDEX "IDX_items_supplier_code"`);
    await queryRunner.query(`DROP INDEX "IDX_items_sku"`);
    await queryRunner.query(`DROP TABLE "items"`);
  }
}
