import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { ItemLabelDto } from '../../application/dto/item-label.dto';
import type { LabelModel } from '../../application/dto/generate-item-labels.dto';
import {
  LABEL_PDF_GENERATOR_PORT,
  type ILabelPdfGeneratorPort,
} from '../../application/ports/outbound/label-pdf-generator.port';

/** 1mm em pontos (72 pt = 1 inch = 25,4mm). */
const MM_TO_PT = 72 / 25.4;

/** Multiplicador do scale do bwip-js para melhor nitidez na impressão (PNG com mais pixels, mesmo tamanho no PDF). */
const BARCODE_QUALITY_SCALE = 2;

/** Camufla o preço na etiqueta: 29.90 → 00299000, 109.90 → 001099000 (00 + centavos + 00). */
function camouflagePrice(price: number): string {
  const cents = Math.round(price * 100);
  return '00' + String(cents) + '00';
}

/** Configuração de layout por modelo de etiqueta. */
interface LabelLayout {
  pageWidthPt: number;
  pageHeightPt: number;
  marginPt: number;
  contentHeightPt: number;
  barcodeZonePt: number;
  textZonePt: number;
  /** Quando definido, uma página = uma linha do rolo (várias etiquetas na horizontal com gap). */
  labelsPerRow?: number;
  /** Espaço em mm entre etiquetas na horizontal (entre blocos da mesma linha). */
  gapBetweenLabelsMm?: number;
  barcodeBarHeightMm: number;
  barcodeMaxWidthMm: number;
  barcodeLeftOffsetMm: number;
  textLeftOffsetMm: number;
  barcodeScale: number;
  barcodeTextFontSize: number;
  textFontSize: number;
  nameFontSize: number;
  nameMaxChars: number;
  /** Layout vertical: nome, preço, código de barras (em vez de horizontal). */
  verticalLayout?: boolean;
  /** Margem superior da folha (mm). Quando definido com marginLeftMm, usa margens customizadas. */
  marginTopMm?: number;
  /** Margem esquerda da folha (mm). */
  marginLeftMm?: number;
}

/** Modelo 95x12 — BOPP 95mm x 12mm, margem 1,5mm, zonas 30+30+30. */
function layout95x12(): LabelLayout {
  const marginPt = 1.5 * MM_TO_PT;
  const pageWidthPt = 95 * MM_TO_PT;
  const pageHeightPt = 12 * MM_TO_PT;
  return {
    pageWidthPt,
    pageHeightPt,
    marginPt,
    contentHeightPt: pageHeightPt - 2 * marginPt,
    barcodeZonePt: 30 * MM_TO_PT,
    textZonePt: 30 * MM_TO_PT,
    barcodeBarHeightMm: 4,
    barcodeMaxWidthMm: 22,
    barcodeLeftOffsetMm: 2,
    textLeftOffsetMm: 2,
    barcodeScale: 2,
    barcodeTextFontSize: 5,
    textFontSize: 6,
    nameFontSize: 4,
    nameMaxChars: 25,
    verticalLayout: false,
  };
}

/**
 * Modelo 26x15x3 — Colunas=3, Linhas=1 (3 etiquetas por linha, 1 linha por página).
 * Folha: margem topo=0, esquerda=0,25cm. Etiqueta 2,60×1,50cm, espaço horizontal 0,30cm.
 * Conteúdo: nome (4), preço (7), código de barras (altura 0,45cm, barras 0,70, número 7).
 */
function layout26x15x3(): LabelLayout {
  const labelWidthMm = 26;
  const labelHeightMm = 15;
  const marginPt = 0;
  const pageWidthPt = labelWidthMm * MM_TO_PT;
  const pageHeightPt = labelHeightMm * MM_TO_PT;
  return {
    pageWidthPt,
    pageHeightPt,
    marginPt,
    contentHeightPt: pageHeightPt,
    barcodeZonePt: 10 * MM_TO_PT,
    textZonePt: 10 * MM_TO_PT,
    labelsPerRow: 3,
    gapBetweenLabelsMm: 3,
    marginTopMm: 1.5,
    marginLeftMm: 12,
    barcodeBarHeightMm: 4.5,
    barcodeMaxWidthMm: 22,
    barcodeLeftOffsetMm: 0,
    textLeftOffsetMm: 0,
    barcodeScale: 6,
    barcodeTextFontSize: 5,
    textFontSize: 4,
    nameFontSize: 5,
    nameMaxChars: 14,
    verticalLayout: true,
  };
}

function getLayout(model: LabelModel | undefined): LabelLayout {
  return model === '26x15x3' ? layout26x15x3() : layout95x12();
}

@Injectable()
export class LabelPdfGeneratorService implements ILabelPdfGeneratorPort {
  async generate(labels: ItemLabelDto[], model?: LabelModel): Promise<Buffer> {
    const layout = getLayout(model);
    if (!labels?.length) {
      return this.createEmptyPdf(layout);
    }

    const useRowLayout =
      layout.labelsPerRow != null &&
      layout.labelsPerRow > 0 &&
      layout.gapBetweenLabelsMm != null;

    let pageSize: [number, number];
    let marginPt: number;
    let marginObj: { top: number; left: number; right: number; bottom: number } | undefined;

    if (useRowLayout) {
      const perRow = layout.labelsPerRow!;
      const gapPt = layout.gapBetweenLabelsMm! * MM_TO_PT;
      const labelWidthPt = layout.pageWidthPt;
      const rowPageWidthPt = perRow * labelWidthPt + (perRow - 1) * gapPt;
      pageSize = [rowPageWidthPt, layout.pageHeightPt];
      if (layout.marginTopMm != null && layout.marginLeftMm != null) {
        const topPt = layout.marginTopMm * MM_TO_PT;
        const leftPt = layout.marginLeftMm * MM_TO_PT;
        marginObj = { top: topPt, left: leftPt, right: 0, bottom: 0 };
        marginPt = 0;
      } else {
        marginPt = 0;
      }
    } else {
      pageSize = [layout.pageWidthPt, layout.pageHeightPt];
      marginPt = layout.marginPt;
    }

    const docMargin = marginObj ?? marginPt;

    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({
        size: pageSize,
        margin: docMargin as number,
        autoFirstPage: true,
      });
      // Térmica: apenas preto, sem cores
      doc.fillColor('black');
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      if (useRowLayout && layout.labelsPerRow != null && layout.gapBetweenLabelsMm != null) {
        const rowSize = layout.labelsPerRow;
        const gapPt = layout.gapBetweenLabelsMm * MM_TO_PT;
        const labelWidthPt = layout.pageWidthPt;
        const stepPt = labelWidthPt + gapPt;
        for (let r = 0; r < labels.length; r += rowSize) {
          if (r > 0) {
            doc.addPage({ size: pageSize, margin: docMargin as number });
          }
          const rowLabels = labels.slice(r, r + rowSize);
          for (let c = 0; c < rowLabels.length; c++) {
            const offsetX = c * stepPt;
            await this.drawLabel(doc, rowLabels[c], layout, offsetX);
          }
        }
      } else {
        for (let i = 0; i < labels.length; i++) {
          if (i > 0) {
            doc.addPage({ size: pageSize, margin: marginPt });
          }
          await this.drawLabel(doc, labels[i], layout);
        }
      }

      doc.end();
    });
  }

  private async drawLabel(
    doc: InstanceType<typeof PDFDocument>,
    label: ItemLabelDto,
    layout: LabelLayout,
    offsetXPt?: number,
  ): Promise<void> {
    doc.fillColor('black');
    if (layout.verticalLayout) {
      await this.drawLabelVertical(doc, label, layout, offsetXPt);
    } else {
      await this.drawLabelHorizontal(doc, label, layout, offsetXPt);
    }
  }

  /** Layout vertical 26x15x3: nome (4), preço (7), código de barras (altura 0,45cm, número 7). */
  private async drawLabelVertical(
    doc: InstanceType<typeof PDFDocument>,
    label: ItemLabelDto,
    layout: LabelLayout,
    offsetXPt?: number,
  ): Promise<void> {
    const baseX = offsetXPt ?? layout.marginPt;
    const baseY = layout.marginTopMm != null ? layout.marginTopMm * MM_TO_PT : layout.marginPt;
    const contentWidthPt = layout.pageWidthPt;
    const contentHeightPt = layout.contentHeightPt;
    const contentX = baseX;
    const gapPt = 1;

    let currentY = baseY;

    const productName = (label.name || '').trim().slice(0, layout.nameMaxChars);
    if (productName) {
      doc.fontSize(layout.nameFontSize);
      doc.text(productName, contentX, currentY, { width: contentWidthPt, align: 'center' });
      currentY += layout.nameFontSize * 1.2 + gapPt;
    }

    doc.fontSize(layout.textFontSize);
    doc.text(camouflagePrice(label.price), contentX, currentY, { width: contentWidthPt, align: 'center' });
    currentY += layout.textFontSize * 1.2 + gapPt;

    const barcodeText = (label.barcode || '').trim();
    doc.fontSize(layout.barcodeTextFontSize);
    doc.text(barcodeText || '—', contentX, currentY, { width: contentWidthPt, align: 'center' });
    currentY += layout.barcodeTextFontSize * 1.2 + gapPt;

    const spaceForBarcode = contentHeightPt - (currentY - baseY) - gapPt;
    let barcodeHeightPt = 0;

    if (barcodeText && spaceForBarcode > 4) {
      try {
        const bwipjs = await import('bwip-js');
        const scale = Math.min(12, Math.max(2, Math.round(layout.barcodeScale * BARCODE_QUALITY_SCALE)));
        const png = (await bwipjs.default.toBuffer({
          bcid: 'ean13',
          text: barcodeText,
          scale,
          height: layout.barcodeBarHeightMm,
          includetext: false,
          guardwhitespace: true,
        })) as Buffer;
        const imgW = png.readUInt32BE(16);
        const imgH = png.readUInt32BE(20);
        const maxBarcodeWidthPt = Math.min(layout.barcodeMaxWidthMm * MM_TO_PT, contentWidthPt);
        barcodeHeightPt = Math.min(spaceForBarcode, layout.barcodeBarHeightMm * MM_TO_PT);
        let barcodeWidthPt = barcodeHeightPt * (imgW / imgH);
        if (barcodeWidthPt > maxBarcodeWidthPt) {
          barcodeWidthPt = maxBarcodeWidthPt;
          barcodeHeightPt = barcodeWidthPt * (imgH / imgW);
        }
        const barcodeX = contentX + (contentWidthPt - barcodeWidthPt) / 2;
        doc.image(png, barcodeX, currentY, { width: barcodeWidthPt, height: barcodeHeightPt });
      } catch {
        // fallback
      }
    }
  }

  /** Layout horizontal: código de barras à esquerda | SKU, preço, nome à direita. */
  private async drawLabelHorizontal(
    doc: InstanceType<typeof PDFDocument>,
    label: ItemLabelDto,
    layout: LabelLayout,
    offsetXPt?: number,
  ): Promise<void> {
    const x = offsetXPt ?? layout.marginPt;
    const y = layout.marginPt;
    const { barcodeZonePt, textZonePt, contentHeightPt } = layout;

    const barcodeText = (label.barcode || '').trim();
    try {
      const bwipjs = await import('bwip-js');
      const scale = Math.min(12, Math.max(2, Math.round(layout.barcodeScale * BARCODE_QUALITY_SCALE)));
      const png = await bwipjs.default.toBuffer({
        bcid: 'ean13',
        text: barcodeText,
        scale,
        height: layout.barcodeBarHeightMm,
        includetext: false,
        guardwhitespace: true,
      });
      const imgW = png.readUInt32BE(16);
      const imgH = png.readUInt32BE(20);
      const maxBarcodeWidthPt = layout.barcodeMaxWidthMm * MM_TO_PT;
      const maxBarcodeHeightPt = contentHeightPt - layout.barcodeTextFontSize * 1.5;
      let barcodeWidthPt = maxBarcodeWidthPt;
      let barcodeHeightPt = barcodeWidthPt * (imgH / imgW);
      if (barcodeHeightPt > maxBarcodeHeightPt) {
        barcodeHeightPt = maxBarcodeHeightPt;
        barcodeWidthPt = barcodeHeightPt * (imgW / imgH);
      }
      const leftOffsetPt = layout.barcodeLeftOffsetMm * MM_TO_PT;
      const barcodeX = x + (barcodeZonePt - barcodeWidthPt) / 2 - leftOffsetPt;
      const blockHeight = barcodeHeightPt + layout.barcodeTextFontSize * 1.3;
      const barcodeY = y + (contentHeightPt - blockHeight) / 2;
      doc.image(png, barcodeX, barcodeY, {
        width: barcodeWidthPt,
        height: barcodeHeightPt,
      });
      doc.fontSize(layout.barcodeTextFontSize).text(barcodeText, barcodeX, barcodeY + barcodeHeightPt + 1, {
        width: barcodeWidthPt,
        align: 'center',
      });
    } catch {
      doc.fontSize(layout.barcodeTextFontSize).text(barcodeText || '—', x, y, {
        width: barcodeZonePt,
        align: 'center',
      });
    }

    const textX = x + barcodeZonePt - layout.textLeftOffsetMm * MM_TO_PT;
    const lineHeightPt = layout.textFontSize * 1.2;
    const textBlockHeightPt = 2 * lineHeightPt + layout.nameFontSize * 1.1;
    const textStartY = y + (contentHeightPt - textBlockHeightPt) / 2;
    doc.fontSize(layout.textFontSize);
    doc.text(label.sku, textX, textStartY, {
      width: textZonePt,
      align: 'center',
    });
    doc.fontSize(layout.textFontSize).text(
      camouflagePrice(label.price),
      textX,
      textStartY + lineHeightPt,
      { width: textZonePt, align: 'center' },
    );
    const productName = (label.name || '').trim().slice(0, layout.nameMaxChars);
    if (productName) {
      doc.fontSize(layout.nameFontSize).text(productName, textX, textStartY + 2 * lineHeightPt, {
        width: textZonePt,
        align: 'center',
      });
    }
  }

  private createEmptyPdf(layout: LabelLayout): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [layout.pageWidthPt, layout.pageHeightPt],
        margin: layout.marginPt,
      });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.fontSize(layout.textFontSize).text('Nenhuma etiqueta para imprimir.', layout.marginPt, layout.marginPt);
      doc.end();
    });
  }
}
