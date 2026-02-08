/**
 * Entidade base do domínio (DDD).
 * Entidades possuem identidade e ciclo de vida.
 */
export abstract class BaseEntity<TId> {
  constructor(protected readonly id: TId) {}

  equals(other: BaseEntity<TId>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return this.id === other.id;
  }

  getId(): TId {
    return this.id;
  }
}
