import {
  IsString,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Linha de entrada de estoque na atualização: produto identificado por barcode ou itemId e quantidade.
 * Aceita barcode (preferido) ou itemId para compatibilidade com clientes que enviam itemId.
 */
export class UpdateStockEntryLineDto {
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
 * DTO de entrada para atualizar uma entrada de estoque (pedido).
 * Referência, fornecedor e linhas são opcionais.
 * Se linhas forem enviadas: reverte as quantidades antigas nos itens e aplica as novas (atualiza estoque).
 */
export class UpdateStockEntryDto {
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

  /** Novas linhas (opcional). Se enviado, reverte as antigas nos itens e aplica estas (atualiza estoque). */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStockEntryLineDto)
  lines?: UpdateStockEntryLineDto[];
}
