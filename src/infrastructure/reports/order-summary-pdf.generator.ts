import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import type { OrderSummaryDto } from '../../application/dto/order-summary.dto';
import {
  ORDER_SUMMARY_PDF_GENERATOR_PORT,
  type IOrderSummaryPdfGeneratorPort,
} from '../../application/ports/outbound/order-summary-pdf-generator.port';

/** Formata data YYYY-MM-DD para DD/MM/YYYY. */
function formatDateBr(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return dateStr;
  const [y, m, d] = dateStr.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** Formata data e hora para o rodapé: DD/MM/YYYY às HH:mm */
function formatDateTimeBr(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${y} às ${h}:${min}`;
}

/** Formata valor monetário. */
function formatMoney(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

/** Labels dos métodos de pagamento para exibição no PDF. */
const PAYMENT_METHOD_LABELS: Record<keyof OrderSummaryDto['totalsByPaymentMethod'], string> = {
  PIX: 'PIX',
  MONEY: 'Dinheiro',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
};

const FOOTER_MARGIN = 55;
const LOGO_MAX_WIDTH = 300;
const LOGO_MAX_HEIGHT = 120;
const RIGHT_MARGIN = -150;
const FOOTER_COLOR = '#b0b0b0';

@Injectable()
export class OrderSummaryPdfGeneratorService
  implements IOrderSummaryPdfGeneratorPort
{
  constructor(private readonly configService: ConfigService) {}

  async generate(summary: OrderSummaryDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const generatedAt = new Date();
      const footerText = `Gerado em ${formatDateTimeBr(generatedAt)}`;

      const dateBr = formatDateBr(summary.date);

      const logoPath = this.configService.get<string>('storeLogoPath');
      if (logoPath) {
        const resolved = path.isAbsolute(logoPath) ? logoPath : path.resolve(process.cwd(), logoPath);
        if (existsSync(resolved)) {
          try {
            const logoX = doc.page.width - RIGHT_MARGIN - LOGO_MAX_WIDTH;
            doc.image(resolved, logoX, 50, {
              width: LOGO_MAX_WIDTH,
              height: LOGO_MAX_HEIGHT,
              fit: [LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT],
            });
          } catch {
            // ignora falha ao carregar imagem
          }
        }
      }

      doc.fontSize(18).font('Helvetica-Bold').text('Resumo do dia', 50, 50);
      doc.fontSize(12).font('Helvetica').text(dateBr, 50, 72);

      doc.moveDown(1.5);
      let y = 110;

      doc.fontSize(11).font('Helvetica-Bold').text('Totais', 50, y);
      y += 22;
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total de comandas: ${summary.totalOrders}`, 50, y);
      y += 18;
      const totalsByPayment = summary.totalsByPaymentMethod ?? {};
      for (const [key, label] of Object.entries(PAYMENT_METHOD_LABELS)) {
        const value = totalsByPayment[key as keyof typeof totalsByPayment] ?? 0;
        doc.text(`${label}: ${formatMoney(value)}`, 50, y);
        y += 18;
      }
      y += 8;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 14;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Valor total: ${formatMoney(summary.totalValue)}`, 50, y);
      y += 24;

      if (summary.salesLines?.length) {
        doc.fontSize(11).font('Helvetica-Bold').text('Produtos vendidos', 50, y);
        y += 22;

        const colComanda = 50;
        const colProd = 130;
        const colQtd = 380;
        const colVal = 450;

        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Nº Comanda', colComanda, y);
        doc.text('Produto', colProd, y);
        doc.text('Qtd', colQtd, y);
        doc.text('Valor total', colVal, y);
        y += 18;

        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 12;

        doc.font('Helvetica');
        for (const line of summary.salesLines) {
          doc.text(line.comandaNumber, colComanda, y, { width: 75 });
          const name = (line.productName || '(sem nome)').slice(0, 35);
          doc.text(name, colProd, y, { width: 240 });
          doc.text(String(line.quantitySold), colQtd, y);
          doc.text(formatMoney(line.totalAmount), colVal, y);
          y += 18;
        }
      } else {
        doc.fontSize(10).font('Helvetica').text('Nenhum produto vendido neste dia.', 50, y);
      }

      const footerY = doc.page.height - FOOTER_MARGIN;
      doc.fontSize(9).font('Helvetica').fillColor(FOOTER_COLOR);
      doc.text(footerText, 50, footerY, { align: 'left', lineBreak: false });
      doc.fillColor('#000000');

      doc.end();
    });
  }
}
