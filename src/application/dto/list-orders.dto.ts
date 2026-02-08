import {
  IsOptional,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

const ORDER_STATUS_FILTER = ['OPEN', 'PAID', 'CANCELLED', 'REFUNDED', 'ALL'] as const;

/** Valores padrão de paginação (padrão de mercado). */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 5;
export const MAX_LIMIT = 100;

/**
 * DTO de filtros e paginação para listagem de comandas (orders).
 * Filtros são aplicados em conjunto (AND). Paginação: page 1-based, limit por página.
 */
export class ListOrdersDto {
  @IsOptional()
  @IsIn(ORDER_STATUS_FILTER)
  status?: (typeof ORDER_STATUS_FILTER)[number];

  /** Data inicial (inclusive). YYYY-MM-DD ou ISO 8601. */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^\d{4}-\d{2}-\d{2}/, {
    message: 'startDate deve ser no formato YYYY-MM-DD',
  })
  startDate?: string;

  /** Data final (inclusive). YYYY-MM-DD ou ISO 8601. */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^\d{4}-\d{2}-\d{2}/, {
    message: 'endDate deve ser no formato YYYY-MM-DD',
  })
  endDate?: string;

  /** Página (1-based). Padrão: 1. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'page deve ser pelo menos 1' })
  page?: number;

  /** Itens por página. Padrão: 10. Máximo: 100. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'limit deve ser pelo menos 1' })
  @Max(MAX_LIMIT, { message: `limit não pode exceder ${MAX_LIMIT}` })
  limit?: number;
}
