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
import { REGISTER_STOCK_ENTRY_INBOUND_PORT } from '../../../application/ports/inbound/register-stock-entry.inbound-port';
import type { IRegisterStockEntryInboundPort } from '../../../application/ports/inbound/register-stock-entry.inbound-port';
import { LIST_STOCK_ENTRIES_INBOUND_PORT } from '../../../application/ports/inbound/list-stock-entries.inbound-port';
import type { IListStockEntriesInboundPort } from '../../../application/ports/inbound/list-stock-entries.inbound-port';
import { GET_STOCK_ENTRY_BY_ID_INBOUND_PORT } from '../../../application/ports/inbound/get-stock-entry-by-id.inbound-port';
import type { IGetStockEntryByIdInboundPort } from '../../../application/ports/inbound/get-stock-entry-by-id.inbound-port';
import { UPDATE_STOCK_ENTRY_INBOUND_PORT } from '../../../application/ports/inbound/update-stock-entry.inbound-port';
import type { IUpdateStockEntryInboundPort } from '../../../application/ports/inbound/update-stock-entry.inbound-port';
import { RegisterStockEntryDto } from '../../../application/dto/register-stock-entry.dto';
import { UpdateStockEntryDto } from '../../../application/dto/update-stock-entry.dto';
import type { StockEntryResponseDto } from '../dto/stock-entry-response.dto';
import type { StockEntry } from '../../../domain/entities/stock-entry';

/**
 * Controller HTTP para Entrada de Estoque (notas/pedidos).
 * Rotas: /api/v1/stock-entries
 * Estoque é alimentado apenas por este fluxo (não mais pelo cadastro do produto).
 */
@Controller('stock-entries')
export class StockEntryController {
  constructor(
    @Inject(REGISTER_STOCK_ENTRY_INBOUND_PORT)
    private readonly registerStockEntryUseCase: IRegisterStockEntryInboundPort,
    @Inject(LIST_STOCK_ENTRIES_INBOUND_PORT)
    private readonly listStockEntriesUseCase: IListStockEntriesInboundPort,
    @Inject(GET_STOCK_ENTRY_BY_ID_INBOUND_PORT)
    private readonly getStockEntryByIdUseCase: IGetStockEntryByIdInboundPort,
    @Inject(UPDATE_STOCK_ENTRY_INBOUND_PORT)
    private readonly updateStockEntryUseCase: IUpdateStockEntryInboundPort,
  ) {}

  @Post()
  async register(
    @Body() body: RegisterStockEntryDto,
  ): Promise<StockEntryResponseDto> {
    const entry = await this.registerStockEntryUseCase.execute(body);
    return toStockEntryResponse(entry);
  }

  @Get()
  async findAll(): Promise<StockEntryResponseDto[]> {
    const entries = await this.listStockEntriesUseCase.execute();
    return entries.map(toStockEntryResponse);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<StockEntryResponseDto> {
    const entry = await this.getStockEntryByIdUseCase.execute(id);
    if (!entry) {
      throw new NotFoundException(
        `Entrada de estoque com id ${id} não encontrada`,
      );
    }
    return toStockEntryResponse(entry);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateStockEntryDto,
  ): Promise<StockEntryResponseDto> {
    const entry = await this.updateStockEntryUseCase.execute(id, body);
    if (!entry) {
      throw new NotFoundException(
        `Entrada de estoque com id ${id} não encontrada`,
      );
    }
    return toStockEntryResponse(entry);
  }
}

function toStockEntryResponse(entry: StockEntry): StockEntryResponseDto {
  return {
    id: entry.getId(),
    reference: entry.reference,
    supplier: entry.supplier,
    lines: entry.lines.map((line) => ({
      itemId: line.itemId,
      quantity: line.quantity,
    })),
    createdAt: entry.createdAt.toISOString(),
  };
}
