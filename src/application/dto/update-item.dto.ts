import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

/**
 * DTO de entrada para o use case de atualizar Item (atualização parcial).
 * Todos os campos são opcionais; apenas os enviados são atualizados.
 */
export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  /** Supplier/internal code (manually editable). */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  supplierCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
