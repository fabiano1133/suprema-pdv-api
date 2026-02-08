import { BaseEntity } from './base.entity';

/**
 * Entidade de domínio: Item do pedido (OrderItem) - DDD.
 * Representa uma linha do pedido com identidade própria (pivot Order ↔ Item).
 * Parte do agregado Order; referencia Item apenas por itemId.
 * unitPrice e productName snapshotados para integridade histórica e leitura sem join.
 */
export class OrderItem extends BaseEntity<string> {
  constructor(
    id: string,
    private _orderId: string,
    private _itemId: string,
    private _quantity: number,
    private _unitPrice: number,
    private _productName: string = '',
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    super(id);
  }

  get orderId(): string {
    return this._orderId;
  }

  get itemId(): string {
    return this._itemId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get productName(): string {
    return this._productName;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Subtotal da linha (quantity * unitPrice). */
  get subtotal(): number {
    return this._quantity * this._unitPrice;
  }

  updateQuantity(quantity: number): void {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }
    this._quantity = quantity;
    this._updatedAt = new Date();
  }
}
