import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { ItemLabelDto } from '../../application/dto/item-label.dto';
import {
  LABEL_PDF_GENERATOR_PORT,
  type ILabelPdfGeneratorPort,
} from '../../application/ports/outbound/label-pdf-generator.port';

/**
 * Layout BOPP 95mm x 12mm — compatível com impressoras térmicas Elgin.
 * Uma página PDF por etiqueta; margem mínima (1,5mm).
 * Três zonas de 30mm: código de barras | SKU + valor + nome (valor abaixo do SKU, nome abaixo do valor) | rabicho (vazio).
 */

/** 1mm em pontos (72 pt = 1 inch = 25,4mm). */
const MM_TO_PT = 72 / 25.4;

/** Etiqueta BOPP 95mm x 12mm — compatível com impressoras térmicas Elgin. */
const LABEL_WIDTH_MM = 95;
const LABEL_HEIGHT_MM = 12;
const LABEL_WIDTH_PT = LABEL_WIDTH_MM * MM_TO_PT;
const LABEL_HEIGHT_PT = LABEL_HEIGHT_MM * MM_TO_PT;

/** Margem mínima para térmica (1,5mm). */
const MARGIN_MM = 1.5;
const MARGIN_PT = MARGIN_MM * MM_TO_PT;

/** Área útil após margens. */
const CONTENT_WIDTH_PT = LABEL_WIDTH_PT - 2 * MARGIN_PT;
const CONTENT_HEIGHT_PT = LABEL_HEIGHT_PT - 2 * MARGIN_PT;

/** Zonas de 30mm: barcode | SKU+valor | rabicho. */
const ZONE_MM = 30;
const BARCODE_ZONE_PT = ZONE_MM * MM_TO_PT;
const TEXT_ZONE_PT = ZONE_MM * MM_TO_PT;
/** Rabicho: últimos 30mm da etiqueta (não imprime conteúdo). */
const RABICHO_ZONE_PT = ZONE_MM * MM_TO_PT;

/** Altura das barras em mm (bwip-js). */
const BARCODE_BAR_HEIGHT_MM = 7;

@Injectable()
export class LabelPdfGeneratorService implements ILabelPdfGeneratorPort {
  async generate(labels: ItemLabelDto[]): Promise<Buffer> {
    if (!labels?.length) {
      return this.createEmptyPdf();
    }

    const pageSize: [number, number] = [LABEL_WIDTH_PT, LABEL_HEIGHT_PT];

    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({
        size: pageSize,
        margin: MARGIN_PT,
        autoFirstPage: true,
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      for (let i = 0; i < labels.length; i++) {
        if (i > 0) {
          doc.addPage({ size: pageSize, margin: MARGIN_PT });
        }
        await this.drawLabel(doc, labels[i]);
      }

      doc.end();
    });
  }

  private async drawLabel(
    doc: InstanceType<typeof PDFDocument>,
    label: ItemLabelDto,
  ): Promise<void> {
    const x = MARGIN_PT;
    const y = MARGIN_PT;

    // Zona 1 (30mm): código de barras GTIN-13 (EAN-13)
    try {
      const bwipjs = await import('bwip-js');
      const barcodeText = (label.barcode || '').trim();
      const png = await bwipjs.default.toBuffer({
        bcid: 'ean13',
        text: barcodeText,
        scale: 1,
        height: BARCODE_BAR_HEIGHT_MM,
        includetext: false,
      });
      const imgW = png.readUInt32BE(16);
      const imgH = png.readUInt32BE(20);
      const barcodeHeightPt = Math.min(
        CONTENT_HEIGHT_PT,
        BARCODE_ZONE_PT * (imgH / imgW),
      );
      const barcodeWidthPt = barcodeHeightPt * (imgW / imgH);
      const barcodeX = x + (BARCODE_ZONE_PT - barcodeWidthPt) / 2;
      const barcodeY = y + (CONTENT_HEIGHT_PT - barcodeHeightPt) / 2;
      doc.image(png, barcodeX, barcodeY, {
        width: barcodeWidthPt,
        height: barcodeHeightPt,
      });
    } catch {
      const fallbackText = (label.barcode || '').trim() || '—';
      doc.fontSize(5).text(fallbackText, x, y, {
        width: BARCODE_ZONE_PT,
        align: 'center',
      });
    }

    // Zona 2 (30mm): SKU | valor | nome (fonte pequena, discreta)
    const textX = x + BARCODE_ZONE_PT;
    const fontSize = 6;
    const nameFontSize = 4;
    doc.fontSize(fontSize);
    const lineHeightPt = fontSize * 1.2;
    const nameLineHeightPt = nameFontSize * 1.1;
    const textBlockHeightPt = 2 * lineHeightPt + nameLineHeightPt;
    const textStartY = y + (CONTENT_HEIGHT_PT - textBlockHeightPt) / 2;
    doc.text(label.sku, textX, textStartY, {
      width: TEXT_ZONE_PT,
      align: 'center',
    });
    doc.fontSize(fontSize).text(
      `R$ ${label.price.toFixed(2).replace('.', ',')}`,
      textX,
      textStartY + lineHeightPt,
      { width: TEXT_ZONE_PT, align: 'center' },
    );
    const productName = (label.name || '').trim().slice(0, 25);
    if (productName) {
      doc.fontSize(nameFontSize).text(productName, textX, textStartY + 2 * lineHeightPt, {
        width: TEXT_ZONE_PT,
        align: 'center',
      });
    }

    // Zona 3 (30mm): rabicho — sem conteúdo
  }

  private createEmptyPdf(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [LABEL_WIDTH_PT, LABEL_HEIGHT_PT],
        margin: MARGIN_PT,
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.fontSize(6).text('Nenhuma etiqueta para imprimir.', MARGIN_PT, MARGIN_PT);
      doc.end();
    });
  }
}
