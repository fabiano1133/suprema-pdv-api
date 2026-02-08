import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import {
  GET_HELLO_INBOUND_PORT,
  IGetHelloInboundPort,
} from '../../../application/ports/inbound/get-hello.inbound-port';

describe('AppController', () => {
  let appController: AppController;
  let getHelloPort: IGetHelloInboundPort;

  beforeEach(async () => {
    getHelloPort = {
      execute: jest.fn().mockResolvedValue('Hello World!'),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: GET_HELLO_INBOUND_PORT,
          useValue: getHelloPort,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      await expect(appController.getHello()).resolves.toBe('Hello World!');
      expect(getHelloPort.execute).toHaveBeenCalled();
    });
  });
});
