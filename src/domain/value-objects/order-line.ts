import { BaseValueObject } from './base.value-object';

export interface OrderLineProps {
  itemId: string;
  quantity: number;
  unitPrice: number;
  /** Desnormalizado: evita join com Item na leitura (alta performance). */
  productName?: string;
}

/**
 * Value Object: Linha do pedido (DDD).
 * Parte do agregado Order. Imutável.
 * Referência ao Item apenas por itemId; preço e nome snapshotados na linha
 * para integridade histórica e leitura sem join (DBA alta performance).
 */
export class OrderLine extends BaseValueObject<OrderLineProps> {
  constructor(props: OrderLineProps) {
    if (!props.itemId?.trim()) {
      throw new Error('OrderLine itemId cannot be empty');
    }
    if (props.quantity <= 0 || !Number.isInteger(props.quantity)) {
      throw new Error('OrderLine quantity must be a positive integer');
    }
    if (props.unitPrice < 0) {
      throw new Error('OrderLine unitPrice cannot be negative');
    }
    super(props);
  }

  get itemId(): string {
    return this.props.itemId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get productName(): string | undefined {
    return this.props.productName;
  }

  /** Subtotal da linha (quantity * unitPrice). */
  get subtotal(): number {
    return this.props.quantity * this.props.unitPrice;
  }
}
