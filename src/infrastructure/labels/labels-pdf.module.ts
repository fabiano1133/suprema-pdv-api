import { Module } from '@nestjs/common';
import {
  LABEL_PDF_GENERATOR_PORT,
  type ILabelPdfGeneratorPort,
} from '../../application/ports/outbound/label-pdf-generator.port';
import { LabelPdfGeneratorService } from './label-pdf.generator';

/**
 * Módulo de geração de PDF de etiquetas.
 * Implementa a porta ILabelPdfGeneratorPort (PDFKit + código de barras).
 */
@Module({
  providers: [
    LabelPdfGeneratorService,
    {
      provide: LABEL_PDF_GENERATOR_PORT,
      useExisting: LabelPdfGeneratorService,
    },
  ],
  exports: [LABEL_PDF_GENERATOR_PORT],
})
export class LabelsPdfModule {}
