import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  NotFoundException,
} from '@nestjs/common';
import { CREATE_STOCK_COUNT_INBOUND_PORT } from '../../../application/ports/inbound/create-stock-count.inbound-port';
import type { ICreateStockCountInboundPort } from '../../../application/ports/inbound/create-stock-count.inbound-port';
import { ADD_STOCK_COUNT_SCAN_INBOUND_PORT } from '../../../application/ports/inbound/add-stock-count-scan.inbound-port';
import type { IAddStockCountScanInboundPort } from '../../../application/ports/inbound/add-stock-count-scan.inbound-port';
import { FINALIZE_STOCK_COUNT_INBOUND_PORT } from '../../../application/ports/inbound/finalize-stock-count.inbound-port';
import type { IFinalizeStockCountInboundPort } from '../../../application/ports/inbound/finalize-stock-count.inbound-port';
import { GET_STOCK_COUNT_BY_ID_INBOUND_PORT } from '../../../application/ports/inbound/get-stock-count-by-id.inbound-port';
import type { IGetStockCountByIdInboundPort } from '../../../application/ports/inbound/get-stock-count-by-id.inbound-port';
import { LIST_STOCK_COUNTS_INBOUND_PORT } from '../../../application/ports/inbound/list-stock-counts.inbound-port';
import type { IListStockCountsInboundPort } from '../../../application/ports/inbound/list-stock-counts.inbound-port';
import { CreateStockCountDto } from '../../../application/dto/create-stock-count.dto';
import { AddStockCountScanDto } from '../../../application/dto/add-stock-count-scan.dto';
import {
  StockCountResponseDto,
  StockCountLineResponseDto,
} from '../dto/stock-count-response.dto';
import type { StockCount } from '../../../domain/entities/stock-count';

/**
 * Controller HTTP para Conferência/Balanço de estoque.
 * Rotas: /api/v1/stock-counts
 * Fluxo: criar balanço → bipar produtos (POST /:id/scans) → finalizar → comparar contado x sistema.
 */
@Controller('stock-counts')
export class StockCountController {
  constructor(
    @Inject(CREATE_STOCK_COUNT_INBOUND_PORT)
    private readonly createStockCountUseCase: ICreateStockCountInboundPort,
    @Inject(ADD_STOCK_COUNT_SCAN_INBOUND_PORT)
    private readonly addStockCountScanUseCase: IAddStockCountScanInboundPort,
    @Inject(FINALIZE_STOCK_COUNT_INBOUND_PORT)
    private readonly finalizeStockCountUseCase: IFinalizeStockCountInboundPort,
    @Inject(GET_STOCK_COUNT_BY_ID_INBOUND_PORT)
    private readonly getStockCountByIdUseCase: IGetStockCountByIdInboundPort,
    @Inject(LIST_STOCK_COUNTS_INBOUND_PORT)
    private readonly listStockCountsUseCase: IListStockCountsInboundPort,
  ) {}

  @Post()
  async create(@Body() body: CreateStockCountDto): Promise<StockCountResponseDto> {
    const count = await this.createStockCountUseCase.execute(body);
    return toStockCountResponse(count);
  }

  @Post(':id/scans')
  async addScan(
    @Param('id') id: string,
    @Body() body: AddStockCountScanDto,
  ): Promise<StockCountResponseDto> {
    const count = await this.addStockCountScanUseCase.execute(id, body);
    if (!count) {
      throw new NotFoundException(
        `Balanço com id ${id} não encontrado ou já finalizado`,
      );
    }
    return toStockCountResponse(count);
  }

  @Patch(':id/finalize')
  async finalize(@Param('id') id: string): Promise<StockCountResponseDto> {
    const count = await this.finalizeStockCountUseCase.execute(id);
    if (!count) {
      throw new NotFoundException(
        `Balanço com id ${id} não encontrado ou já finalizado`,
      );
    }
    return toStockCountResponse(count);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<StockCountResponseDto> {
    const count = await this.getStockCountByIdUseCase.execute(id);
    if (!count) {
      throw new NotFoundException(`Balanço com id ${id} não encontrado`);
    }
    return toStockCountResponse(count);
  }

  @Get()
  async findAll(): Promise<StockCountResponseDto[]> {
    const counts = await this.listStockCountsUseCase.execute();
    return counts.map(toStockCountResponse);
  }
}

function toStockCountResponse(count: StockCount): StockCountResponseDto {
  const lines: StockCountLineResponseDto[] = count.lines.map((line) => ({
    itemId: line.itemId,
    countedQuantity: line.countedQuantity,
    ...(line.systemQuantity !== undefined && { systemQuantity: line.systemQuantity }),
    ...(line.variance !== undefined && { variance: line.variance }),
  }));
  return {
    id: count.getId(),
    code: count.code,
    name: count.name,
    description: count.description,
    status: count.status,
    lines,
    createdAt: count.createdAt.toISOString(),
    ...(count.finalizedAt && {
      finalizedAt: count.finalizedAt.toISOString(),
    }),
  };
}
