import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

/**
 * DTO de entrada para o use case de criar Item.
 * SKU é gerado automaticamente a partir do nome (regra global no domínio).
 * Código de barras é informado no payload (não mais gerado automaticamente).
 * Estoque inicia em 0; use entrada de notas/pedidos para dar entrada no estoque.
 */
export class CreateItemDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  costPrice!: number;

  /** Supplier/internal code (manually provided). */
  @IsString()
  @MaxLength(100)
  supplierCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
