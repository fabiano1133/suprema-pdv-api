import type { ItemLabelDto } from '../../dto/item-label.dto';
import type { LabelModel } from '../../dto/generate-item-labels.dto';

/**
 * Porta de saída (Outbound Port) - Gerador de PDF de etiquetas.
 * A infraestrutura implementa (ex.: PDFKit + código de barras).
 */
export const LABEL_PDF_GENERATOR_PORT = Symbol('LabelPdfGeneratorPort');

export interface ILabelPdfGeneratorPort {
  /**
   * Gera um PDF com as etiquetas (uma por entrada no array).
   * @param labels Dados das etiquetas (SKU, price, barcode).
   * @param model Modelo da etiqueta: 95x12 (padrão) ou 26x15x3.
   * @returns Buffer do PDF.
   */
  generate(labels: ItemLabelDto[], model?: LabelModel): Promise<Buffer>;
}
