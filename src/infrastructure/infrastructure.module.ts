import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { LabelsPdfModule } from './labels/labels-pdf.module';
import { ReportsPdfModule } from './reports/reports-pdf.module';

/**
 * Módulo de infraestrutura - Adapters de saída (Outbound).
 * Usa persistência in-memory para testes locais; troque por módulo de DB em produção.
 */
@Module({
  imports: [PersistenceModule.forRoot(), LabelsPdfModule, ReportsPdfModule],
  exports: [PersistenceModule, LabelsPdfModule, ReportsPdfModule],
})
export class InfrastructureModule {}
