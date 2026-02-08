import { BaseEntity } from './base.entity';
import { StockEntryLine } from '../value-objects/stock-entry-line';

/**
 * Agregado de domínio: Entrada de Estoque (DDD).
 * Representa uma entrada de notas/pedidos: documento com linhas (produto, quantidade).
 * Ao ser registrada, as quantidades são somadas ao estoque dos itens.
 */
export class StockEntry extends BaseEntity<string> {
  constructor(
    id: string,
    /** Número da nota fiscal, pedido de compra ou referência externa (opcional). */
    private readonly _reference: string | undefined,
    /** Fornecedor (opcional). */
    private readonly _supplier: string | undefined,
    /** Linhas da entrada: itemId e quantidade recebida. */
    private readonly _lines: StockEntryLine[],
    private readonly _createdAt: Date = new Date(),
  ) {
    super(id);
  }

  get reference(): string | undefined {
    return this._reference;
  }

  get supplier(): string | undefined {
    return this._supplier;
  }

  get lines(): readonly StockEntryLine[] {
    return this._lines;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
