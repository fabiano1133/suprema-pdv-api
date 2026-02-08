import { Inject, Injectable } from '@nestjs/common';
import type { Order } from '../../domain/entities/order';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepositoryPort,
} from '../../domain/ports/order-repository.port';
import type { IGetOrdersSummaryInboundPort } from '../ports/inbound/get-orders-summary.inbound-port';
import type {
  OrderSummaryDto,
  ProductSoldDto,
  SalesLineDto,
  TotalsByPaymentMethodDto,
} from '../dto/order-summary.dto';
import type { PaymentMethod } from '../../domain/entities/order';

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Retorna a data no formato YYYY-MM-DD no fuso horário local do servidor (evita problema UTC vs horário local). */
function toDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(value: string): string | null {
  if (!value?.trim()) return null;
  const parsed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(parsed) ? parsed : null;
}

/**
 * Caso de uso: Resumo de comandas por dia.
 * Contabiliza somente comandas com status PAID (paga).
 * Retorna quantidade total de comandas pagas, valor total e produtos vendidos no dia.
 */
@Injectable()
export class GetOrdersSummaryUseCase implements IGetOrdersSummaryInboundPort {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
  ) {}

  async execute(date: string): Promise<OrderSummaryDto> {
    const dateStr = parseDate(date);
    const emptyTotalsByPaymentMethod: TotalsByPaymentMethodDto = {
      PIX: 0,
      MONEY: 0,
      CREDIT_CARD: 0,
      DEBIT_CARD: 0,
    };
    if (!dateStr) {
      return {
        date: date?.trim() ?? '',
        totalOrders: 0,
        totalValue: 0,
        totalsByPaymentMethod: emptyTotalsByPaymentMethod,
        comandaNumbers: [],
        productsSold: [],
        salesLines: [],
      };
    }

    const orders = await this.orderRepository.findAll();
    const ordersOfDay = orders.filter(
      (order) =>
        toDateOnly(order.createdAt) === dateStr && order.status === 'PAID',
    );

    const totalOrders = ordersOfDay.length;
    const totalValue = ordersOfDay.reduce((sum, o) => sum + o.total, 0);
    const comandaNumbers = ordersOfDay.map((o) => o.comNumber);

    const totalsByPaymentMethod: TotalsByPaymentMethodDto = {
      PIX: 0,
      MONEY: 0,
      CREDIT_CARD: 0,
      DEBIT_CARD: 0,
    };
    const paymentMethods: PaymentMethod[] = ['PIX', 'MONEY', 'CREDIT_CARD', 'DEBIT_CARD'];
    for (const order of ordersOfDay) {
      const method = order.paymentMethod;
      if (method && paymentMethods.includes(method)) {
        totalsByPaymentMethod[method] += order.total;
      }
    }
    for (const key of paymentMethods) {
      totalsByPaymentMethod[key] = roundMoney(totalsByPaymentMethod[key]);
    }

    const byItemId = new Map<
      string,
      { productName: string; quantity: number; amount: number }
    >();

    for (const order of ordersOfDay) {
      for (const line of order.lines) {
        const existing = byItemId.get(line.itemId);
        const name = line.productName ?? '';
        const qty = line.quantity;
        const amount = line.subtotal;
        if (existing) {
          existing.quantity += qty;
          existing.amount += amount;
          if (name && !existing.productName) existing.productName = name;
        } else {
          byItemId.set(line.itemId, {
            productName: name,
            quantity: qty,
            amount,
          });
        }
      }
    }

    const productsSold: ProductSoldDto[] = Array.from(byItemId.entries()).map(
      ([itemId, { productName, quantity, amount }]) => ({
        itemId,
        productName,
        quantitySold: quantity,
        totalAmount: roundMoney(amount),
      }),
    );

    const salesLines: SalesLineDto[] = [];
    for (const order of ordersOfDay) {
      for (const line of order.lines) {
        salesLines.push({
          comandaNumber: order.comNumber,
          productName: line.productName ?? '',
          quantitySold: line.quantity,
          totalAmount: roundMoney(line.subtotal),
        });
      }
    }

    return {
      date: dateStr,
      totalOrders,
      totalValue: roundMoney(totalValue),
      totalsByPaymentMethod,
      comandaNumbers,
      productsSold,
      salesLines,
    };
  }
}
