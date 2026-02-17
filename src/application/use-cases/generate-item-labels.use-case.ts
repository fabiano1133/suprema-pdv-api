import { Inject, Injectable } from '@nestjs/common';
import type { Item } from '../../domain/entities/item';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { IGenerateItemLabelsInboundPort } from '../ports/inbound/generate-item-labels.inbound-port';
import type { ItemLabelDto } from '../dto/item-label.dto';
import type { GenerateItemLabelsDto } from '../dto/generate-item-labels.dto';
import { DomainValidationException } from '../errors/domain-validation.exception';

/** Arredonda valor monetário para 2 casas (exibição na etiqueta). */
function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Caso de uso: Gerar etiquetas para os itens cadastrados.
 * Permite informar id do produto e quantidade de etiquetas por produto.
 * Retorna dados para impressão: SKU, preço, código de barras (uma entrada por etiqueta).
 */
@Injectable()
export class GenerateItemLabelsUseCase implements IGenerateItemLabelsInboundPort {
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(dto: GenerateItemLabelsDto): Promise<ItemLabelDto[]> {
    if (!dto?.items?.length) {
      return [];
    }

    const result: ItemLabelDto[] = [];

    for (const entry of dto.items) {
      const { itemId, quantity } = entry;

      if (quantity == null || quantity < 1 || !Number.isInteger(quantity)) {
        throw new DomainValidationException(
          `Quantidade de etiquetas deve ser um número inteiro positivo. Recebido para item ${itemId}: ${quantity}.`,
        );
      }

      const item = await this.itemRepository.findById(itemId);
      if (!item) {
        throw new DomainValidationException(
          `Produto com id ${itemId} não encontrado.`,
        );
      }

      const label = this.toLabelDto(item);
      for (let i = 0; i < quantity; i++) {
        result.push(label);
      }
    }

    return result;
  }

  private toLabelDto(item: Item): ItemLabelDto {
    return {
      name: item.name,
      sku: item.sku,
      price: roundPrice(item.price),
      barcode: item.barcode,
      supplierCode: item.supplierCode,
    };
  }
}
