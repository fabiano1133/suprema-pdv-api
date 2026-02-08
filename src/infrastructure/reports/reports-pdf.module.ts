import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  ORDER_SUMMARY_PDF_GENERATOR_PORT,
  type IOrderSummaryPdfGeneratorPort,
} from '../../application/ports/outbound/order-summary-pdf-generator.port';
import { OrderSummaryPdfGeneratorService } from './order-summary-pdf.generator';

/**
 * Módulo de geração de PDFs de relatórios (resumo do dia, etc.).
 */
@Module({
  imports: [ConfigModule],
  providers: [
    OrderSummaryPdfGeneratorService,
    {
      provide: ORDER_SUMMARY_PDF_GENERATOR_PORT,
      useExisting: OrderSummaryPdfGeneratorService,
    },
  ],
  exports: [ORDER_SUMMARY_PDF_GENERATOR_PORT],
})
export class ReportsPdfModule {}
