import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { AppController } from './http/controllers/app.controller';
import { ItemController } from './http/controllers/item.controller';
import { OrderController } from './http/controllers/order.controller';
import { StockEntryController } from './http/controllers/stock-entry.controller';
import { StockCountController } from './http/controllers/stock-count.controller';

/**
 * Módulo de apresentação - Adapters de entrada (Inbound).
 * Controllers HTTP, GraphQL, CLI, etc.
 */
@Module({
  imports: [ApplicationModule, InfrastructureModule],
  controllers: [
    AppController,
    ItemController,
    OrderController,
    StockEntryController,
    StockCountController,
  ],
})
export class PresentationModule {}
