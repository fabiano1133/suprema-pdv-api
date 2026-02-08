import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Header,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { CREATE_ORDER_INBOUND_PORT } from '../../../application/ports/inbound/create-order.inbound-port';
import type { ICreateOrderInboundPort } from '../../../application/ports/inbound/create-order.inbound-port';
import { LIST_ORDERS_INBOUND_PORT } from '../../../application/ports/inbound/list-orders.inbound-port';
import type { IListOrdersInboundPort } from '../../../application/ports/inbound/list-orders.inbound-port';
import { GET_ORDER_BY_ID_INBOUND_PORT } from '../../../application/ports/inbound/get-order-by-id.inbound-port';
import type { IGetOrderByIdInboundPort } from '../../../application/ports/inbound/get-order-by-id.inbound-port';
import { PAY_ORDER_INBOUND_PORT } from '../../../application/ports/inbound/pay-order.inbound-port';
import type { IPayOrderInboundPort } from '../../../application/ports/inbound/pay-order.inbound-port';
import { ADD_ITEM_TO_ORDER_INBOUND_PORT } from '../../../application/ports/inbound/add-item-to-order.inbound-port';
import type { IAddItemToOrderInboundPort } from '../../../application/ports/inbound/add-item-to-order.inbound-port';
import { REMOVE_ITEM_FROM_ORDER_INBOUND_PORT } from '../../../application/ports/inbound/remove-item-from-order.inbound-port';
import type { IRemoveItemFromOrderInboundPort } from '../../../application/ports/inbound/remove-item-from-order.inbound-port';
import { GET_ORDERS_SUMMARY_INBOUND_PORT } from '../../../application/ports/inbound/get-orders-summary.inbound-port';
import type { IGetOrdersSummaryInboundPort } from '../../../application/ports/inbound/get-orders-summary.inbound-port';
import { ORDER_SUMMARY_PDF_GENERATOR_PORT } from '../../../application/ports/outbound/order-summary-pdf-generator.port';
import type { IOrderSummaryPdfGeneratorPort } from '../../../application/ports/outbound/order-summary-pdf-generator.port';
import { CreateOrderDto } from '../../../application/dto/create-order.dto';
import { PayOrderDto } from '../../../application/dto/pay-order.dto';
import { AddItemToOrderDto } from '../../../application/dto/add-item-to-order.dto';
import { ListOrdersDto } from '../../../application/dto/list-orders.dto';
import type { OrderSummaryDto } from '../../../application/dto/order-summary.dto';
import type {
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from '../dto/order-response.dto';
import { toOrderResponse } from '../mappers/order.mapper';

/**
 * Controller HTTP para Order (venda/comanda).
 * Rotas: /api/v1/orders
 */
@Controller('orders')
export class OrderController {
  constructor(
    @Inject(CREATE_ORDER_INBOUND_PORT)
    private readonly createOrderUseCase: ICreateOrderInboundPort,
    @Inject(LIST_ORDERS_INBOUND_PORT)
    private readonly listOrdersUseCase: IListOrdersInboundPort,
    @Inject(GET_ORDER_BY_ID_INBOUND_PORT)
    private readonly getOrderByIdUseCase: IGetOrderByIdInboundPort,
    @Inject(PAY_ORDER_INBOUND_PORT)
    private readonly payOrderUseCase: IPayOrderInboundPort,
    @Inject(ADD_ITEM_TO_ORDER_INBOUND_PORT)
    private readonly addItemToOrderUseCase: IAddItemToOrderInboundPort,
    @Inject(REMOVE_ITEM_FROM_ORDER_INBOUND_PORT)
    private readonly removeItemFromOrderUseCase: IRemoveItemFromOrderInboundPort,
    @Inject(GET_ORDERS_SUMMARY_INBOUND_PORT)
    private readonly getOrdersSummaryUseCase: IGetOrdersSummaryInboundPort,
    @Inject(ORDER_SUMMARY_PDF_GENERATOR_PORT)
    private readonly orderSummaryPdfGenerator: IOrderSummaryPdfGeneratorPort,
  ) {}

  @Post()
  async create(
    @Body(new DefaultValuePipe({})) body: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.createOrderUseCase.execute(body);
    return toOrderResponse(order);
  }

  @Get()
  async findAll(
    @Query() filters: ListOrdersDto,
  ): Promise<PaginatedOrdersResponseDto> {
    const result = await this.listOrdersUseCase.execute(filters);
    return {
      data: result.data.map(toOrderResponse),
      meta: result.meta,
    };
  }

  @Get('summary')
  async getSummary(
    @Query('date') date: string,
  ): Promise<OrderSummaryDto> {
    return this.getOrdersSummaryUseCase.execute(date ?? '');
  }

  @Get('summary/pdf')
  @Header('Content-Type', 'application/pdf')
  async getSummaryPdf(
    @Query('date') date: string,
  ): Promise<StreamableFile> {
    const summary = await this.getOrdersSummaryUseCase.execute(date ?? '');
    const pdfBuffer = await this.orderSummaryPdfGenerator.generate(summary);
    const filename = summary.date
      ? `resumo-${summary.date}.pdf`
      : 'resumo-dia.pdf';
    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `inline; filename="${filename}"`,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    const order = await this.getOrderByIdUseCase.execute(id);
    if (!order) {
      throw new NotFoundException(`Comanda com id ${id} não encontrada`);
    }
    return toOrderResponse(order);
  }

  @Patch(':id/pay')
  async pay(
    @Param('id') id: string,
    @Body() body: PayOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.payOrderUseCase.execute(id, body.paymentMethod);
    if (!order) {
      throw new NotFoundException(`Comanda com id ${id} não encontrada`);
    }
    return toOrderResponse(order);
  }

  @Post(':id/items')
  async addItem(
    @Param('id') id: string,
    @Body() body: AddItemToOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.addItemToOrderUseCase.execute(id, body);
    if (!order) {
      throw new NotFoundException(`Comanda com id ${id} não encontrada`);
    }
    return toOrderResponse(order);
  }

  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.removeItemFromOrderUseCase.execute(id, itemId);
    if (!order) {
      throw new NotFoundException(`Comanda com id ${id} não encontrada`);
    }
    return toOrderResponse(order);
  }
}
