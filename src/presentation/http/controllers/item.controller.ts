import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { LABEL_PDF_GENERATOR_PORT } from '../../../application/ports/outbound/label-pdf-generator.port';
import type { ILabelPdfGeneratorPort } from '../../../application/ports/outbound/label-pdf-generator.port';
import { CREATE_ITEM_INBOUND_PORT } from '../../../application/ports/inbound/create-item.inbound-port';
import type { ICreateItemInboundPort } from '../../../application/ports/inbound/create-item.inbound-port';
import { LIST_ITEMS_INBOUND_PORT } from '../../../application/ports/inbound/list-items.inbound-port';
import type { IListItemsInboundPort } from '../../../application/ports/inbound/list-items.inbound-port';
import { GET_ITEM_BY_ID_INBOUND_PORT } from '../../../application/ports/inbound/get-item-by-id.inbound-port';
import type { IGetItemByIdInboundPort } from '../../../application/ports/inbound/get-item-by-id.inbound-port';
import { UPDATE_ITEM_INBOUND_PORT } from '../../../application/ports/inbound/update-item.inbound-port';
import type { IUpdateItemInboundPort } from '../../../application/ports/inbound/update-item.inbound-port';
import { DELETE_ITEM_INBOUND_PORT } from '../../../application/ports/inbound/delete-item.inbound-port';
import type { IDeleteItemInboundPort } from '../../../application/ports/inbound/delete-item.inbound-port';
import { GENERATE_ITEM_LABELS_INBOUND_PORT } from '../../../application/ports/inbound/generate-item-labels.inbound-port';
import type { IGenerateItemLabelsInboundPort } from '../../../application/ports/inbound/generate-item-labels.inbound-port';
import { CreateItemDto } from '../../../application/dto/create-item.dto';
import { UpdateItemDto } from '../../../application/dto/update-item.dto';
import { GenerateItemLabelsDto } from '../../../application/dto/generate-item-labels.dto';
import { ListItemsDto } from '../../../application/dto/list-items.dto';
import type {
  ItemResponseDto,
  PaginatedItemsResponseDto,
} from '../dto/item-response.dto';
import type { ItemLabelDto } from '../../../application/dto/item-label.dto';
import { toItemResponse } from '../mappers/item.mapper';

/**
 * Controller HTTP para Item (produto do catálogo).
 * Rotas: /api/v1/items
 */
@Controller('items')
export class ItemController {
  constructor(
    @Inject(CREATE_ITEM_INBOUND_PORT)
    private readonly createItemUseCase: ICreateItemInboundPort,
    @Inject(LIST_ITEMS_INBOUND_PORT)
    private readonly listItemsUseCase: IListItemsInboundPort,
    @Inject(GET_ITEM_BY_ID_INBOUND_PORT)
    private readonly getItemByIdUseCase: IGetItemByIdInboundPort,
    @Inject(UPDATE_ITEM_INBOUND_PORT)
    private readonly updateItemUseCase: IUpdateItemInboundPort,
    @Inject(DELETE_ITEM_INBOUND_PORT)
    private readonly deleteItemUseCase: IDeleteItemInboundPort,
    @Inject(GENERATE_ITEM_LABELS_INBOUND_PORT)
    private readonly generateItemLabelsUseCase: IGenerateItemLabelsInboundPort,
    @Inject(LABEL_PDF_GENERATOR_PORT)
    private readonly labelPdfGenerator: ILabelPdfGeneratorPort,
  ) {}

  @Post()
  async create(@Body() body: CreateItemDto): Promise<ItemResponseDto> {
    const item = await this.createItemUseCase.execute(body);
    return toItemResponse(item);
  }

  @Get()
  async findAll(
    @Query() filters: ListItemsDto,
  ): Promise<PaginatedItemsResponseDto> {
    const result = await this.listItemsUseCase.execute(filters);
    return {
      data: result.data.map(toItemResponse),
      meta: result.meta,
    };
  }

  @Post('labels')
  async generateLabels(
    @Body() body: GenerateItemLabelsDto,
  ): Promise<ItemLabelDto[]> {
    const dto = { items: body?.items ?? [] };
    return this.generateItemLabelsUseCase.execute(dto);
  }

  @Post('labels/pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="etiquetas.pdf"')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('X-Content-Type-Options', 'nosniff')
  async generateLabelsPdf(
    @Body() body: GenerateItemLabelsDto,
  ): Promise<StreamableFile> {
    const dto = { items: body?.items ?? [], model: body?.model };
    const labels = await this.generateItemLabelsUseCase.execute(dto);
    const pdfBuffer = await this.labelPdfGenerator.generate(labels, body?.model);
    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: 'inline',
      length: pdfBuffer.length,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ItemResponseDto> {
    const item = await this.getItemByIdUseCase.execute(id);
    if (!item) {
      throw new NotFoundException(`Item com id ${id} não encontrado`);
    }
    return toItemResponse(item);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateItemDto,
  ): Promise<ItemResponseDto> {
    const item = await this.updateItemUseCase.execute(id, body);
    if (!item) {
      throw new NotFoundException(`Item com id ${id} não encontrado`);
    }
    return toItemResponse(item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const deleted = await this.deleteItemUseCase.execute(id);
    if (!deleted) {
      throw new NotFoundException(`Item com id ${id} não encontrado`);
    }
  }
}
