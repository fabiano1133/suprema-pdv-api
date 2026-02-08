import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Item } from '../../domain/entities/item';
import { generateSkuFromProductName } from '../../domain/services/sku-generator';
import { generateGtin13 } from '../../domain/services/barcode-generator';
import {
  ITEM_REPOSITORY_PORT,
  type IItemRepositoryPort,
} from '../../domain/ports/item-repository.port';
import type { ICreateItemInboundPort } from '../ports/inbound/create-item.inbound-port';
import type { CreateItemDto } from '../dto/create-item.dto';
import { DomainValidationException } from '../errors/domain-validation.exception';

/**
 * Caso de uso: Criar Item (produto do catálogo).
 * SKU gerado automaticamente a partir do nome (regra global do domínio).
 * Código de barras recebido no payload (não mais gerado automaticamente).
 */
@Injectable()
export class CreateItemUseCase implements ICreateItemInboundPort {
  constructor(
    @Inject(ITEM_REPOSITORY_PORT)
    private readonly itemRepository: IItemRepositoryPort,
  ) {}

  async execute(input: CreateItemDto): Promise<Item> {
    if (!input.name?.trim()) {
      throw new DomainValidationException('Name is required');
    }
    if (typeof input.price !== 'number' || input.price < 0) {
      throw new DomainValidationException('Price must be a non-negative number');
    }
    if (typeof input.costPrice !== 'number' || input.costPrice < 0) {
      throw new DomainValidationException(
        'Cost price must be a non-negative number',
      );
    }
    if (!input.supplierCode?.trim()) {
      throw new DomainValidationException('Supplier code is required');
    }

    const id = randomUUID();
    const nameTrimmed = input.name.trim();
    const description = input.description ?? '';
    const supplierCodeTrimmed = input.supplierCode.trim();

    // SKU possui parte aleatória (hex). Em caso raro de colisão no Postgres,
    // tentamos regenerar algumas vezes.
    const maxAttempts = 5;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const sku = generateSkuFromProductName(nameTrimmed);
      const barcode = await this.generateUniqueBarcode();
      const item = new Item(
        id,
        nameTrimmed,
        input.price,
        input.costPrice,
        sku,
        supplierCodeTrimmed,
        barcode,
        0, // estoque inicia em 0; use entrada de notas/pedidos para dar entrada
        description,
      );

      try {
        return await this.itemRepository.save(item);
      } catch (e) {
        lastError = e;
        const msg = e instanceof Error ? e.message : '';
        // Retry apenas para erro de unique no Postgres
        if (msg.includes('duplicate key') && attempt < maxAttempts) {
          continue;
        }
        throw e;
      }
    }

    throw new DomainValidationException(
      lastError instanceof Error ? lastError.message : 'Erro ao salvar o item',
    );
  }

  private async generateUniqueBarcode(): Promise<string> {
    // Try a few times; extremely unlikely to collide, but DB has UNIQUE constraint.
    for (let attempt = 1; attempt <= 10; attempt++) {
      const barcode = generateGtin13();
      const existing = await this.itemRepository.findByBarcode(barcode);
      if (!existing) return barcode;
    }
    throw new DomainValidationException('Could not generate a unique barcode');
  }
}
