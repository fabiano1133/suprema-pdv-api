import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Linha de entrada de estoque: produto identificado por barcode ou itemId e quantidade recebida.
 * Aceita barcode (preferido) ou itemId para compatibilidade com clientes que enviam itemId.
 */
export class RegisterStockEntryLineDto {
  /** Código de barras do produto (identificação da linha). */
  @IsOptional()
  @IsString()
  barcode?: string;

  /** ID do produto (alternativa ao barcode). */
  @IsOptional()
  @IsString()
  itemId?: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

/**
 * DTO de entrada para registrar uma entrada de estoque (nota/pedido).
 * Estoque dos itens é aumentado pelas quantidades informadas.
 */
export class RegisterStockEntryDto {
  /** Número da nota fiscal, pedido de compra ou referência (opcional). */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  /** Fornecedor (opcional). */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  supplier?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'É necessário ao menos uma linha na entrada de estoque.' })
  @ValidateNested({ each: true })
  @Type(() => RegisterStockEntryLineDto)
  lines!: RegisterStockEntryLineDto[];
}
