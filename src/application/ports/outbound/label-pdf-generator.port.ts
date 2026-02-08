import type { ItemLabelDto } from '../../dto/item-label.dto';

/**
 * Porta de saída (Outbound Port) - Gerador de PDF de etiquetas.
 * A infraestrutura implementa (ex.: PDFKit + código de barras).
 */
export const LABEL_PDF_GENERATOR_PORT = Symbol('LabelPdfGeneratorPort');

export interface ILabelPdfGeneratorPort {
  /**
   * Gera um PDF com as etiquetas (uma por entrada no array).
   * @param labels Dados das etiquetas (SKU, price, barcode).
   * @returns Buffer do PDF.
   */
  generate(labels: ItemLabelDto[]): Promise<Buffer>;
}
