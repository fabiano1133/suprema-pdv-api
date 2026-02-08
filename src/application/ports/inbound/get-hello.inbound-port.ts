/**
 * Porta de entrada (Inbound Port) - Arquitetura Hexagonal.
 * Interface que a aplicação expõe; os adapters (controllers) chamam.
 */
export const GET_HELLO_INBOUND_PORT = Symbol('GetHelloInboundPort');

export interface IGetHelloInboundPort {
  execute(): Promise<string>;
}
