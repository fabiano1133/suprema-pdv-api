import { Inject, Injectable } from '@nestjs/common';
import type { Order } from '../../domain/entities/order';
import {
  ORDER_REPOSITORY_PORT,
  type IOrderRepositoryPort,
} from '../../domain/ports/order-repository.port';
import type { IListOrdersInboundPort } from '../ports/inbound/list-orders.inbound-port';
import type { ListOrdersDto } from '../dto/list-orders.dto';
import {
  type PaginatedResultDto,
  buildPaginationMeta,
} from '../dto/paginated-result.dto';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../dto/list-orders.dto';

/**
 * Caso de uso: Listar comandas com filtros opcionais (status e data) e paginação.
 */
@Injectable()
export class ListOrdersUseCase implements IListOrdersInboundPort {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: IOrderRepositoryPort,
  ) {}

  async execute(
    filters?: ListOrdersDto,
  ): Promise<PaginatedResultDto<Order>> {
    const allOrders = await this.orderRepository.findAll();
    const filtered =
      !filters || this.isEmptyFilters(filters)
        ? allOrders
        : allOrders.filter((order) => this.matchesFilters(order, filters));

    const page = Math.max(1, filters?.page ?? DEFAULT_PAGE);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, filters?.limit ?? DEFAULT_LIMIT),
    );
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * limit;
    const data = filtered.slice(skip, skip + limit);

    const meta = buildPaginationMeta(total, currentPage, limit);

    return { data, meta };
  }

  private isEmptyFilters(filters: ListOrdersDto): boolean {
    return (
      filters.status === undefined &&
      filters.startDate === undefined &&
      filters.endDate === undefined
    );
  }

  private matchesFilters(order: Order, filters: ListOrdersDto): boolean {
    if (
      filters.status !== undefined &&
      filters.status !== 'ALL' &&
      order.status !== filters.status
    ) {
      return false;
    }

    const orderDateStr = this.toDateOnly(order.createdAt);

    if (filters.startDate !== undefined) {
      const startStr = this.parseDate(filters.startDate);
      if (startStr != null && orderDateStr < startStr) return false;
    }

    if (filters.endDate !== undefined) {
      const endStr = this.parseDate(filters.endDate);
      if (endStr != null && orderDateStr > endStr) return false;
    }

    return true;
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private parseDate(value: string): string | null {
    if (!value?.trim()) return null;
    const parsed = value.trim().slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(parsed) ? parsed : null;
  }
}
