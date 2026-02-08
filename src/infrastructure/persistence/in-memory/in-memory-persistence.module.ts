import { Module } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT } from '../../../domain/ports/order-repository.port';
import { ITEM_REPOSITORY_PORT } from '../../../domain/ports/item-repository.port';
import { ORDER_ITEM_REPOSITORY_PORT } from '../../../domain/ports/order-item-repository.port';
import { STOCK_ENTRY_REPOSITORY_PORT } from '../../../domain/ports/stock-entry-repository.port';
import { STOCK_COUNT_REPOSITORY_PORT } from '../../../domain/ports/stock-count-repository.port';
import { InMemoryOrderRepository } from './in-memory-order.repository';
import { InMemoryItemRepository } from './in-memory-item.repository';
import { InMemoryOrderItemRepository } from './in-memory-order-item.repository';
import { InMemoryStockEntryRepository } from './in-memory-stock-entry.repository';
import { InMemoryStockCountRepository } from './in-memory-stock-count.repository';

/**
 * Módulo de persistência in-memory para testes locais e desenvolvimento.
 * Fornece repositórios que implementam as portas do domínio.
 */
@Module({
  providers: [
    InMemoryOrderRepository,
    InMemoryItemRepository,
    InMemoryOrderItemRepository,
    InMemoryStockEntryRepository,
    InMemoryStockCountRepository,
    { provide: ORDER_REPOSITORY_PORT, useExisting: InMemoryOrderRepository },
    { provide: ITEM_REPOSITORY_PORT, useExisting: InMemoryItemRepository },
    {
      provide: ORDER_ITEM_REPOSITORY_PORT,
      useExisting: InMemoryOrderItemRepository,
    },
    {
      provide: STOCK_ENTRY_REPOSITORY_PORT,
      useExisting: InMemoryStockEntryRepository,
    },
    {
      provide: STOCK_COUNT_REPOSITORY_PORT,
      useExisting: InMemoryStockCountRepository,
    },
  ],
  exports: [
    ORDER_REPOSITORY_PORT,
    ITEM_REPOSITORY_PORT,
    ORDER_ITEM_REPOSITORY_PORT,
    STOCK_ENTRY_REPOSITORY_PORT,
    STOCK_COUNT_REPOSITORY_PORT,
  ],
})
export class InMemoryPersistenceModule {}
