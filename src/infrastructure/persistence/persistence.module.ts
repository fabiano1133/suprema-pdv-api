import { DynamicModule, Module } from '@nestjs/common';
import { InMemoryPersistenceModule } from './in-memory/in-memory-persistence.module';
import { TypeOrmPersistenceModule } from './typeorm/typeorm-persistence.module';

/**
 * Módulo de persistência (Hexagonal - outbound adapters).
 * Por padrão usa in-memory; em produção use PERSISTENCE_DRIVER=postgres.
 */
@Module({})
export class PersistenceModule {
  static forRoot(): DynamicModule {
    const driver = (process.env.PERSISTENCE_DRIVER ?? 'in_memory')
      .trim()
      .toLowerCase();
    const selected =
      driver === 'postgres' ? TypeOrmPersistenceModule : InMemoryPersistenceModule;

    return {
      module: PersistenceModule,
      imports: [selected],
      exports: [selected],
    };
  }
}

