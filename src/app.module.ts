import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PresentationModule } from './presentation/presentation.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import configuration from './infrastructure/config/configuration';

/**
 * Módulo raiz - DDD + Arquitetura Hexagonal.
 * Config centralizado para segurança e escalabilidade (env, CORS, etc.).
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PresentationModule,
    InfrastructureModule,
  ],
})
export class AppModule {}
