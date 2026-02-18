import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
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
  labelsPerRow?: number;
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
  verticalLayout?: boolean;
  marginTopMm?: number;
  marginLeftMm?: number;
  rowPageWidthMm?: number;
  contentGapPt?: number;
  lineHeightMult?: number;
  /** Layout vertical: gerar código de barras via toSVG (vetorial) em vez de PNG. */
  useSvgBarcode?: boolean;
}

/** Modelo 95x12 — BOPP 95mm x 12mm. Margem 1mm, zonas ampliadas para preencher melhor a etiqueta. */
function layout95x12(): LabelLayout {
  const marginPt = 1 * MM_TO_PT;
  const pageWidthPt = 95 * MM_TO_PT;
  const pageHeightPt = 12 * MM_TO_PT;
  return {
    pageWidthPt,
    pageHeightPt,
    marginPt,
    contentHeightPt: pageHeightPt - 2 * marginPt,
    barcodeZonePt: 38 * MM_TO_PT,
    textZonePt: 55 * MM_TO_PT,
    barcodeBarHeightMm: 6.5,
    barcodeMaxWidthMm: 26,
    barcodeLeftOffsetMm: 1,
    textLeftOffsetMm: 1,
    barcodeScale: 2,
    barcodeTextFontSize: 6,
    textFontSize: 7,
    nameFontSize: 5,
    nameMaxChars: 40,
    verticalLayout: false,
  };
}

/** Modelo 26x15x3 — Configuração alinhada ao software antigo (Elgin L42 Pro, 3 colunas). */
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
    barcodeBarHeightMm: 12,
    barcodeMaxWidthMm: 26,
    barcodeLeftOffsetMm: 0,
    textLeftOffsetMm: 0,
    barcodeScale: 1,
    barcodeTextFontSize: 7,
    textFontSize: 5,
    nameFontSize: 4,
    nameMaxChars: 24,
    verticalLayout: true,
    contentGapPt: 0.5,
    lineHeightMult: 1.05,
    useSvgBarcode: true,
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
    let marginObj:
      | { top: number; left: number; right: number; bottom: number }
      | undefined;

    if (useRowLayout) {
      const perRow = layout.labelsPerRow!;
      const gapPt = layout.gapBetweenLabelsMm! * MM_TO_PT;
      const labelWidthPt = layout.pageWidthPt;
      const rowPageWidthPt =
        layout.rowPageWidthMm != null
          ? layout.rowPageWidthMm * MM_TO_PT
          : perRow * labelWidthPt + (perRow - 1) * gapPt;
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
      doc.fillColor('black');
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      if (
        useRowLayout &&
        layout.labelsPerRow != null &&
        layout.gapBetweenLabelsMm != null
      ) {
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

  /** Layout vertical 26x15x3: nome, preço, código de barras (imagem), supplierCode. */
  private async drawLabelVertical(
    doc: InstanceType<typeof PDFDocument>,
    label: ItemLabelDto,
    layout: LabelLayout,
    offsetXPt?: number,
  ): Promise<void> {
    const baseX = offsetXPt ?? layout.marginPt;
    const baseY =
      layout.marginTopMm != null
        ? layout.marginTopMm * MM_TO_PT
        : layout.marginPt;
    const contentWidthPt = layout.pageWidthPt;
    const contentHeightPt = layout.contentHeightPt;
    const contentX = baseX;
    const gapPt = layout.contentGapPt ?? 1;
    const lineMult = layout.lineHeightMult ?? 1.2;

    let currentY = baseY;

    const productName = (label.name || '').trim().slice(0, layout.nameMaxChars);
    if (productName) {
      doc.fontSize(layout.nameFontSize);
      doc.text(productName, contentX, currentY, {
        width: contentWidthPt,
        align: 'center',
      });
      currentY += layout.nameFontSize * lineMult + gapPt;
    }

    doc.fontSize(layout.textFontSize);
    doc.text(camouflagePrice(label.price), contentX, currentY, {
      width: contentWidthPt,
      align: 'center',
    });
    currentY += layout.textFontSize * lineMult + gapPt;

    const barcodeText = (label.barcode || '').trim();
    const spaceForBarcode = contentHeightPt - (currentY - baseY) - gapPt;
    let barcodeHeightPt = 0;

    if (barcodeText && spaceForBarcode > 4) {
      const maxBarcodeWidthPt = Math.min(
        layout.barcodeMaxWidthMm * MM_TO_PT,
        contentWidthPt,
      );
      const maxBarcodeHeightPt = Math.min(
        spaceForBarcode,
        layout.barcodeBarHeightMm * MM_TO_PT,
      );
      const barcodeOffsetLeftPt = 1.5 * MM_TO_PT;

      if (layout.useSvgBarcode) {
        try {
          const bwipjs = await import('bwip-js');
          const api = bwipjs.default;
          
          const opts = {
            bcid: 'ean13',
            text: barcodeText,
            scale: 2,
            height: 8,
            includetext: false,
            guardwhitespace: false,
          };
          const svgString = api.render(opts, api.drawingSVG());
          const vbMatch = svgString.match(
            /viewBox\s*=\s*["']?\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/,
          );
          let vbX: number, vbY: number, vbW: number, vbH: number;
          if (vbMatch) {
            vbX = parseFloat(vbMatch[1]);
            vbY = parseFloat(vbMatch[2]);
            vbW = parseFloat(vbMatch[3]);
            vbH = parseFloat(vbMatch[4]);
          } else {
            const wMatch = svgString.match(/width="([^"]+)"/);
            const hMatch = svgString.match(/height="([^"]+)"/);
            vbX = 0;
            vbY = 0;
            vbW = wMatch ? parseFloat(wMatch[1]) : 100;
            vbH = hMatch ? parseFloat(hMatch[1]) : 40;
          }
          const barcodeWidthPt = contentWidthPt;
          const scaleFactor = Math.min(
            barcodeWidthPt / vbW,
            maxBarcodeHeightPt / vbH,
          );
          const renderW = vbW * scaleFactor;
          const renderH = vbH * scaleFactor;
          barcodeHeightPt = renderH;
          const barcodeX = contentX + (contentWidthPt - renderW) / 2 - barcodeOffsetLeftPt;

          doc.save();
          doc.translate(barcodeX, currentY);
          doc.scale(scaleFactor);
          doc.translate(-vbX, -vbY);
          SVGtoPDF(doc, svgString, 0, 0);
          doc.restore();
        } catch {
          // fallback
        }
      } else {
        try {
          const bwipjs = await import('bwip-js');
          const scale = Math.min(
            12,
            Math.max(
              2,
              Math.round(layout.barcodeScale * BARCODE_QUALITY_SCALE),
            ),
          );
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
          barcodeHeightPt = Math.min(
            spaceForBarcode,
            layout.barcodeBarHeightMm * MM_TO_PT,
          );
          let barcodeWidthPt = barcodeHeightPt * (imgW / imgH);
          if (barcodeWidthPt > maxBarcodeWidthPt) {
            barcodeWidthPt = maxBarcodeWidthPt;
            barcodeHeightPt = barcodeWidthPt * (imgH / imgW);
          }
          const barcodeX = contentX + (contentWidthPt - barcodeWidthPt) / 2 - barcodeOffsetLeftPt;
          doc.image(png, barcodeX, currentY, {
            width: barcodeWidthPt,
            height: barcodeHeightPt,
          });
        } catch {
          // fallback
        }
      }
    }

    const supplierCode = (label.supplierCode || '')
      .trim()
      .slice(0, layout.nameMaxChars);
    if (supplierCode) {
      currentY += barcodeHeightPt + gapPt;
      doc.fontSize(layout.textFontSize);
      doc.text(supplierCode, contentX, currentY, {
        width: contentWidthPt,
        align: 'center',
      });
    }
  }

  /** Layout horizontal: código de barras à esquerda | supplierCode, preço, nome à direita. */
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
      const scale = Math.min(
        12,
        Math.max(2, Math.round(layout.barcodeScale * BARCODE_QUALITY_SCALE)),
      );
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
      const maxBarcodeHeightPt = contentHeightPt;
      let barcodeWidthPt = maxBarcodeWidthPt;
      let barcodeHeightPt = barcodeWidthPt * (imgH / imgW);
      if (barcodeHeightPt > maxBarcodeHeightPt) {
        barcodeHeightPt = maxBarcodeHeightPt;
        barcodeWidthPt = barcodeHeightPt * (imgW / imgH);
      }
      const leftOffsetPt = layout.barcodeLeftOffsetMm * MM_TO_PT;
      const barcodeX = x + (barcodeZonePt - barcodeWidthPt) / 2 - leftOffsetPt;
      const barcodeY = y + (contentHeightPt - barcodeHeightPt) / 2;
      doc.image(png, barcodeX, barcodeY, {
        width: barcodeWidthPt,
        height: barcodeHeightPt,
      });
    } catch {
      // sem número do barcode
    }

    const textX = x + barcodeZonePt - layout.textLeftOffsetMm * MM_TO_PT;
    const lineHeightPt = layout.textFontSize * 1.2;
    const textBlockHeightPt = 2 * lineHeightPt + layout.nameFontSize * 1.1;
    const textStartY = y + (contentHeightPt - textBlockHeightPt) / 2;
    doc.fontSize(layout.textFontSize);
    const supplierCodeRight = (label.supplierCode || '')
      .trim()
      .slice(0, layout.nameMaxChars);
    doc.text(supplierCodeRight || '—', textX, textStartY, {
      width: textZonePt,
      align: 'center',
    });
    doc
      .fontSize(layout.textFontSize)
      .text(camouflagePrice(label.price), textX, textStartY + lineHeightPt, {
        width: textZonePt,
        align: 'center',
      });
    const productName = (label.name || '').trim().slice(0, layout.nameMaxChars);
    if (productName) {
      doc
        .fontSize(layout.nameFontSize)
        .text(productName, textX, textStartY + 2 * lineHeightPt, {
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
      doc
        .fontSize(layout.textFontSize)
        .text(
          'Nenhuma etiqueta para imprimir.',
          layout.marginPt,
          layout.marginPt,
        );
      doc.end();
    });
  }
}
