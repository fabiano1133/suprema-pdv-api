/**
 * Exceção de validação de domínio/aplicação.
 * Usada para erros de regra de negócio (campos obrigatórios, valores inválidos).
 * O filtro global mapeia para HTTP 400 Bad Request.
 */
export class DomainValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationException';
    Object.setPrototypeOf(this, DomainValidationException.prototype);
  }
}
