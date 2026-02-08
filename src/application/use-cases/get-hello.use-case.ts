import { Injectable } from '@nestjs/common';
import {
  GET_HELLO_INBOUND_PORT,
  IGetHelloInboundPort,
} from '../ports/inbound/get-hello.inbound-port';

/**
 * Caso de uso (Application Service) - DDD.
 * Implementa a porta de entrada; orquestra o domínio e adapters.
 */
@Injectable()
export class GetHelloUseCase implements IGetHelloInboundPort {
  async execute(): Promise<string> {
    return 'Hello World!';
  }
}
