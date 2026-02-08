import { BaseEntity } from './base.entity';
import { StockCountLine } from '../value-objects/stock-count-line';

export type StockCountStatus = 'IN_PROGRESS' | 'FINALIZED';

/**
 * Agregado de domínio: Conferência/Balanço de estoque (DDD).
 * Representa uma sessão de contagem: usuário bipa produtos com o coletor;
 * ao finalizar, compara quantidade contada com a quantidade do sistema.
 */
export class StockCount extends BaseEntity<string> {
  constructor(
    id: string,
    /** Código interno exibido (ex: BAL-001), gerado automaticamente. */
    private readonly _code: string,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _status: StockCountStatus,
    /** Linhas: itemId, quantidade contada; ao finalizar inclui systemQuantity e variance. */
    private readonly _lines: StockCountLine[],
    private readonly _createdAt: Date = new Date(),
    private readonly _finalizedAt: Date | undefined = undefined,
  ) {
    super(id);
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get status(): StockCountStatus {
    return this._status;
  }

  get lines(): readonly StockCountLine[] {
    return this._lines;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get finalizedAt(): Date | undefined {
    return this._finalizedAt;
  }
}
