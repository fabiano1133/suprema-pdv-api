import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Modelos de etiqueta: 95x12 (BOPP padrão), 26x15x3 (3 etiquetas por linha). */
export const LABEL_MODELS = ['95x12', '26x15x3'] as const;
export type LabelModel = (typeof LABEL_MODELS)[number];

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

  /** Modelo da etiqueta: 95x12 (padrão) ou 26x15x3. */
  @IsOptional()
  @IsIn(LABEL_MODELS)
  model?: LabelModel;
}
