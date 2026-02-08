import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodToOrders1739100000000 implements MigrationInterface {
  name = 'AddPaymentMethodToOrders1739100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "payment_method" character varying(20) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "payment_method"
    `);
  }
}
