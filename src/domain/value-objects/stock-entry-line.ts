import { BaseValueObject } from './base.value-object';

export interface StockEntryLineProps {
  itemId: string;
  quantity: number;
}

/**
 * Value Object: Linha de entrada de estoque (DDD).
 * Parte do agregado StockEntry. Imutável.
 */
export class StockEntryLine extends BaseValueObject<StockEntryLineProps> {
  constructor(props: StockEntryLineProps) {
    if (!props.itemId?.trim()) {
      throw new Error('StockEntryLine itemId cannot be empty');
    }
    if (props.quantity <= 0 || !Number.isInteger(props.quantity)) {
      throw new Error('StockEntryLine quantity must be a positive integer');
    }
    super(props);
  }

  get itemId(): string {
    return this.props.itemId;
  }

  get quantity(): number {
    return this.props.quantity;
  }
}
