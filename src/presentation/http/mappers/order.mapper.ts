import type { Order } from '../../../domain/entities/order';
import type {
  OrderResponseDto,
  OrderLineResponseDto,
} from '../dto/order-response.dto';

/** Arredonda valor monetário para 2 casas decimais (evita 239.70000000000002). */
function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toOrderResponse(order: Order): OrderResponseDto {
  const lines: OrderLineResponseDto[] = order.lines.map((line) => ({
    itemId: line.itemId,
    quantity: line.quantity,
    unitPrice: roundMoney(line.unitPrice),
    productName: line.productName,
    subtotal: roundMoney(line.subtotal),
  }));

  return {
    id: order.getId(),
    comNumber: order.comNumber,
    status: order.status,
    total: roundMoney(order.total),
    client: order.client ?? '',
    paymentMethod: order.paymentMethod ?? null,
    lines,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}
