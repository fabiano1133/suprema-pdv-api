import { BaseValueObject } from './base.value-object';

export interface StockCountLineProps {
  itemId: string;
  /** Quantidade contada pelo coletor (bipagem). */
  countedQuantity: number;
  /** Quantidade no sistema no momento da finalização (snapshot). */
  systemQuantity?: number;
  /** Diferença: contado - sistema (positivo = sobra, negativo = falta). */
  variance?: number;
}

/**
 * Value Object: Linha de conferência/balanço (DDD).
 * Parte do agregado StockCount. Imutável.
 * systemQuantity e variance são preenchidos ao finalizar o balanço.
 */
export class StockCountLine extends BaseValueObject<StockCountLineProps> {
  constructor(props: StockCountLineProps) {
    if (!props.itemId?.trim()) {
      throw new Error('StockCountLine itemId cannot be empty');
    }
    if (
      props.countedQuantity == null ||
      props.countedQuantity < 0 ||
      !Number.isInteger(props.countedQuantity)
    ) {
      throw new Error(
        'StockCountLine countedQuantity must be a non-negative integer',
      );
    }
    super(props);
  }

  get itemId(): string {
    return this.props.itemId;
  }

  get countedQuantity(): number {
    return this.props.countedQuantity;
  }

  get systemQuantity(): number | undefined {
    return this.props.systemQuantity;
  }

  get variance(): number | undefined {
    return this.props.variance;
  }
}
