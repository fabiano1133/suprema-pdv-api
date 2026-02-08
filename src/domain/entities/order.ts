import { BaseEntity } from './base.entity';
import { OrderLine } from '../value-objects/order-line';

export type OrderStatus = 'OPEN' | 'PAID' | 'CANCELLED' | 'REFUNDED';

/** Forma de pagamento ao fechar a comanda. */
export type PaymentMethod = 'PIX' | 'MONEY' | 'CREDIT_CARD' | 'DEBIT_CARD';

/** Status para filtro de listagem: status reais da comanda ou ALL (todas). */
export type OrderStatusFilter = OrderStatus | 'ALL';

/**
 * Aggregate Root: Pedido (Order) - DDD.
 * Uma Order possui várias linhas (OrderLine); Item é referenciado apenas por itemId.
 * Total derivado das linhas na escrita, armazenado para leitura rápida (alta performance).
 * comNumber: código da comanda (ex.: COM-0001, COM-0002).
 */
export class Order extends BaseEntity<string> {
  private readonly _lines: OrderLine[] = [];

  constructor(
    id: string,
    private _status: OrderStatus,
    private _total: number,
    private _comNumber: string,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    lines?: OrderLine[],
    private _client?: string,
    private _paymentMethod: PaymentMethod | null = null,
  ) {
    super(id);
    if (lines?.length) {
      this._lines.push(...lines);
      this._total = this._sumLinesTotal();
    }
  }

  get status(): OrderStatus {
    return this._status;
  }

  get total(): number {
    return this._total;
  }

  /** Código da comanda (ex.: COM-0001, COM-0002). */
  get comNumber(): string {
    return this._comNumber;
  }

  /** Nome ou identificador do cliente (opcional). */
  get client(): string | undefined {
    return this._client;
  }

  /** Forma de pagamento (preenchido ao fechar a comanda). */
  get paymentMethod(): PaymentMethod | null {
    return this._paymentMethod;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Cópia das linhas (não vaza referência do agregado). */
  get lines(): readonly OrderLine[] {
    return [...this._lines];
  }

  /** Total calculado a partir das linhas (single source of truth na escrita). */
  private _sumLinesTotal(): number {
    return this._lines.reduce((sum, line) => sum + line.subtotal, 0);
  }

  private _recalculateTotalAndTouch(): void {
    this._total = this._sumLinesTotal();
    this._updatedAt = new Date();
  }

  private _assertOpen(): void {
    if (this._status !== 'OPEN') {
      throw new Error(`Order is not open. Current status: ${this._status}`);
    }
  }

  /**
   * Adiciona ou atualiza linha pelo itemId (referência ao Item; sem carregar entidade).
   * Preço e nome snapshotados na linha para integridade histórica e leitura sem join.
   */
  addLine(line: OrderLine): void {
    this._assertOpen();
    const existingIndex = this._lines.findIndex((l) => l.itemId === line.itemId);
    if (existingIndex >= 0) {
      const existing = this._lines[existingIndex];
      this._lines[existingIndex] = new OrderLine({
        itemId: existing.itemId,
        quantity: existing.quantity + line.quantity,
        unitPrice: line.unitPrice,
        productName: line.productName ?? existing.productName,
      });
    } else {
      this._lines.push(line);
    }
    this._recalculateTotalAndTouch();
  }

  /** Remove a primeira linha com o itemId informado. */
  removeLine(itemId: string): void {
    this._assertOpen();
    const index = this._lines.findIndex((l) => l.itemId === itemId);
    if (index < 0) {
      throw new Error(`Line with itemId ${itemId} not found`);
    }
    this._lines.splice(index, 1);
    this._recalculateTotalAndTouch();
  }

  /** Atualiza a quantidade da linha pelo itemId. */
  updateLineQuantity(itemId: string, quantity: number): void {
    this._assertOpen();
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }
    const index = this._lines.findIndex((l) => l.itemId === itemId);
    if (index < 0) {
      throw new Error(`Line with itemId ${itemId} not found`);
    }
    const existing = this._lines[index];
    this._lines[index] = new OrderLine({
      itemId: existing.itemId,
      quantity,
      unitPrice: existing.unitPrice,
      productName: existing.productName,
    });
    this._recalculateTotalAndTouch();
  }

  pay(paymentMethod: PaymentMethod): void {
    if (this._status !== 'OPEN') {
      throw new Error(`Order cannot be paid. Current status: ${this._status}`);
    }
    this._paymentMethod = paymentMethod;
    this._status = 'PAID';
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this._status === 'PAID' || this._status === 'REFUNDED') {
      throw new Error(`Order cannot be cancelled. Current status: ${this._status}`);
    }
    this._status = 'CANCELLED';
    this._updatedAt = new Date();
  }

  refund(): void {
    if (this._status !== 'PAID') {
      throw new Error(`Only paid orders can be refunded. Current status: ${this._status}`);
    }
    this._status = 'REFUNDED';
    this._updatedAt = new Date();
  }
}
