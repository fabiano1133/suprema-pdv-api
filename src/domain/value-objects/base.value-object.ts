/**
 * Value Object base (DDD).
 * Objetos de valor são imutáveis e identificados por seus atributos.
 */
export abstract class BaseValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(other: BaseValueObject<T>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
