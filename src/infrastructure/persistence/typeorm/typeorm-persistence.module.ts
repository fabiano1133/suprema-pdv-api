import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ITEM_REPOSITORY_PORT } from '../../../domain/ports/item-repository.port';
import { ORDER_REPOSITORY_PORT } from '../../../domain/ports/order-repository.port';
import { STOCK_ENTRY_REPOSITORY_PORT } from '../../../domain/ports/stock-entry-repository.port';
import { STOCK_COUNT_REPOSITORY_PORT } from '../../../domain/ports/stock-count-repository.port';
import { ItemOrmEntity } from './typeorm.entities/item.orm-entity';

import { OrderOrmEntity } from './typeorm.entities/order.orm-entity';
import { StockEntryOrmEntity } from './typeorm.entities/stock-entry.orm-entity';
import { StockCountOrmEntity } from './typeorm.entities/stock-count.orm-entity';
import { TypeOrmItemRepository } from './typeorm.repositories/typeorm-item.repository';
import { TypeOrmOrderRepository } from './typeorm.repositories/typeorm-order.repository';
import { TypeOrmStockEntryRepository } from './typeorm.repositories/typeorm-stock-entry.repository';
import { TypeOrmStockCountRepository } from './typeorm.repositories/typeorm-stock-count.repository';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('nodeEnv') ?? 'development';
        const isProd = nodeEnv === 'production';
        const db = config.get<any>('db') ?? {};

        // Prefer DATABASE_URL when provided (common in cloud deployments).
        const hasUrl = typeof db.url === 'string' && db.url.length > 0;

        const useMigrations = isProd || process.env.DB_MIGRATIONS === 'true';
        return {
          type: 'postgres' as const,
          ...(hasUrl
            ? { url: db.url }
            : {
                host: db.host,
                port: db.port,
                username: db.username,
                password: db.password,
                database: db.database,
              }),
          autoLoadEntities: true,
          synchronize: db.synchronize === true && !useMigrations,
          migrationsRun: useMigrations,
          migrations: [__dirname + '/migrations/*.{ts,js}'],
          logging: db.logging === true ? true : !isProd,
        };
      },
    }),
    TypeOrmModule.forFeature([
      ItemOrmEntity,
      OrderOrmEntity,
      StockEntryOrmEntity,
      StockCountOrmEntity,
    ]),
  ],
  providers: [
    TypeOrmItemRepository,
    TypeOrmOrderRepository,
    TypeOrmStockEntryRepository,
    TypeOrmStockCountRepository,
    { provide: ITEM_REPOSITORY_PORT, useExisting: TypeOrmItemRepository },
    { provide: ORDER_REPOSITORY_PORT, useExisting: TypeOrmOrderRepository },
    {
      provide: STOCK_ENTRY_REPOSITORY_PORT,
      useExisting: TypeOrmStockEntryRepository,
    },
    {
      provide: STOCK_COUNT_REPOSITORY_PORT,
      useExisting: TypeOrmStockCountRepository,
    },
  ],
  exports: [
    ITEM_REPOSITORY_PORT,
    ORDER_REPOSITORY_PORT,
    STOCK_ENTRY_REPOSITORY_PORT,
    STOCK_COUNT_REPOSITORY_PORT,
  ],
})
export class TypeOrmPersistenceModule {}

