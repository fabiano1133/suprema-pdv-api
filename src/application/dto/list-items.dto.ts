import { IsOptional, IsInt, Min, Max, IsString, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/** Valores padrão de paginação para listagem de items (padrão de mercado). */
export const LIST_ITEMS_DEFAULT_PAGE = 1;
export const LIST_ITEMS_DEFAULT_LIMIT = 5;
export const LIST_ITEMS_MAX_LIMIT = 100;

/**
 * DTO de paginação para listagem de Items (produtos do catálogo).
 * Page 1-based, limit por página.
 */
export class ListItemsDto {
  /** Termo de busca (filtra por SKU ou nome). */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  /** Página (1-based). Padrão: 1. */
  @IsOptional()
  @Transform(({ value }) => {
    // Accept query: ?page=null -> disable pagination (handled in use case)
    if (value === 'null') return null;
    // Keep undefined when not provided
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  })
  @IsInt()
  @Min(1, { message: 'page deve ser pelo menos 1' })
  page?: number | null;

  /** Itens por página. Padrão: 10. Máximo: 100. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'limit deve ser pelo menos 1' })
  @Max(LIST_ITEMS_MAX_LIMIT, {
    message: `limit não pode exceder ${LIST_ITEMS_MAX_LIMIT}`,
  })
  limit?: number;
}
