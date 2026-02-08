import type { Item } from '../../../domain/entities/item';
import type { ItemResponseDto } from '../dto/item-response.dto';

export function toItemResponse(item: Item): ItemResponseDto {
  return {
    id: item.getId(),
    name: item.name,
    price: item.price,
    costPrice: item.costPrice,
    marginPercent: item.marginPercent,
    sku: item.sku,
    supplierCode: item.supplierCode,
    barcode: item.barcode,
    quantity: item.quantity,
    description: item.description,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
