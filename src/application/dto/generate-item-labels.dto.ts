import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO de entrada para gerar etiquetas: id do produto e quantidade a ser gerada.
 */
export class GenerateItemLabelsItemDto {
  @IsString()
  itemId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

/**
 * DTO de entrada para o caso de uso de gerar etiquetas.
 */
export class GenerateItemLabelsDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenerateItemLabelsItemDto)
  items?: GenerateItemLabelsItemDto[];
}
