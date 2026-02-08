/**
 * Meta de paginação (padrão de mercado).
 * Usado em listagens paginadas (orders, items, etc.).
 */
export interface PaginationMetaDto {
  /** Total de itens que atendem aos filtros (sem paginação). */
  total: number;
  /** Página atual (1-based). */
  page: number;
  /** Itens por página. */
  limit: number;
  /** Total de páginas. */
  totalPages: number;
  /** Indica se existe próxima página. */
  hasNextPage: boolean;
  /** Indica se existe página anterior. */
  hasPreviousPage: boolean;
}

/**
 * Resultado paginado genérico.
 */
export interface PaginatedResultDto<T> {
  /** Lista de itens da página atual. */
  data: T[];
  /** Metadados da paginação. */
  meta: PaginationMetaDto;
}

/**
 * Calcula metadados de paginação.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMetaDto {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  return {
    total,
    page: currentPage,
    limit,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}
