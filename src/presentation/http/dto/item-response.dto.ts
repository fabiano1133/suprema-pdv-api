import type { PaginationMetaResponseDto } from './order-response.dto';

/**
 * DTO de resposta HTTP para Item.
 * Garante que a API retorne propriedades públicas (name, price, etc.)
 * em vez dos campos privados da entidade (_name, _price, etc.).
 */
export interface ItemResponseDto {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  marginPercent: number;
  sku: string;
  supplierCode: string;
  barcode: string;
  quantity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/** Resposta paginada de items (produtos do catálogo). */
export interface PaginatedItemsResponseDto {
  data: ItemResponseDto[];
  meta: PaginationMetaResponseDto;
}
