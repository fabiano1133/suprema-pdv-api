import { Controller, Get, Inject } from '@nestjs/common';
import { GET_HELLO_INBOUND_PORT } from '../../../application/ports/inbound/get-hello.inbound-port';
import type { IGetHelloInboundPort } from '../../../application/ports/inbound/get-hello.inbound-port';

/**
 * Adapter de entrada (Inbound) - Arquitetura Hexagonal.
 * Rotas: /api/v1/
 */
@Controller()
export class AppController {
  constructor(
    @Inject(GET_HELLO_INBOUND_PORT)
    private readonly getHelloUseCase: IGetHelloInboundPort,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return this.getHelloUseCase.execute();
  }
}
