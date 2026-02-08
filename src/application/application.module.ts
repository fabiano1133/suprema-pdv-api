import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import {
  GET_HELLO_INBOUND_PORT,
  IGetHelloInboundPort,
} from './ports/inbound/get-hello.inbound-port';
import {
  CREATE_ITEM_INBOUND_PORT,
  ICreateItemInboundPort,
} from './ports/inbound/create-item.inbound-port';
import {
  LIST_ITEMS_INBOUND_PORT,
  IListItemsInboundPort,
} from './ports/inbound/list-items.inbound-port';
import {
  GET_ITEM_BY_ID_INBOUND_PORT,
  IGetItemByIdInboundPort,
} from './ports/inbound/get-item-by-id.inbound-port';
import {
  UPDATE_ITEM_INBOUND_PORT,
  IUpdateItemInboundPort,
} from './ports/inbound/update-item.inbound-port';
import {
  DELETE_ITEM_INBOUND_PORT,
  IDeleteItemInboundPort,
} from './ports/inbound/delete-item.inbound-port';
import {
  CREATE_ORDER_INBOUND_PORT,
  ICreateOrderInboundPort,
} from './ports/inbound/create-order.inbound-port';
import {
  LIST_ORDERS_INBOUND_PORT,
  IListOrdersInboundPort,
} from './ports/inbound/list-orders.inbound-port';
import {
  GET_ORDER_BY_ID_INBOUND_PORT,
  IGetOrderByIdInboundPort,
} from './ports/inbound/get-order-by-id.inbound-port';
import {
  PAY_ORDER_INBOUND_PORT,
  IPayOrderInboundPort,
} from './ports/inbound/pay-order.inbound-port';
import {
  ADD_ITEM_TO_ORDER_INBOUND_PORT,
  IAddItemToOrderInboundPort,
} from './ports/inbound/add-item-to-order.inbound-port';
import {
  REMOVE_ITEM_FROM_ORDER_INBOUND_PORT,
  IRemoveItemFromOrderInboundPort,
} from './ports/inbound/remove-item-from-order.inbound-port';
import {
  GENERATE_ITEM_LABELS_INBOUND_PORT,
  IGenerateItemLabelsInboundPort,
} from './ports/inbound/generate-item-labels.inbound-port';
import {
  GET_ORDERS_SUMMARY_INBOUND_PORT,
  IGetOrdersSummaryInboundPort,
} from './ports/inbound/get-orders-summary.inbound-port';
import {
  REGISTER_STOCK_ENTRY_INBOUND_PORT,
  IRegisterStockEntryInboundPort,
} from './ports/inbound/register-stock-entry.inbound-port';
import {
  LIST_STOCK_ENTRIES_INBOUND_PORT,
  IListStockEntriesInboundPort,
} from './ports/inbound/list-stock-entries.inbound-port';
import {
  GET_STOCK_ENTRY_BY_ID_INBOUND_PORT,
  IGetStockEntryByIdInboundPort,
} from './ports/inbound/get-stock-entry-by-id.inbound-port';
import {
  UPDATE_STOCK_ENTRY_INBOUND_PORT,
  IUpdateStockEntryInboundPort,
} from './ports/inbound/update-stock-entry.inbound-port';
import {
  CREATE_STOCK_COUNT_INBOUND_PORT,
  ICreateStockCountInboundPort,
} from './ports/inbound/create-stock-count.inbound-port';
import {
  ADD_STOCK_COUNT_SCAN_INBOUND_PORT,
  IAddStockCountScanInboundPort,
} from './ports/inbound/add-stock-count-scan.inbound-port';
import {
  FINALIZE_STOCK_COUNT_INBOUND_PORT,
  IFinalizeStockCountInboundPort,
} from './ports/inbound/finalize-stock-count.inbound-port';
import {
  GET_STOCK_COUNT_BY_ID_INBOUND_PORT,
  IGetStockCountByIdInboundPort,
} from './ports/inbound/get-stock-count-by-id.inbound-port';
import {
  LIST_STOCK_COUNTS_INBOUND_PORT,
  IListStockCountsInboundPort,
} from './ports/inbound/list-stock-counts.inbound-port';
import { GetHelloUseCase } from './use-cases/get-hello.use-case';
import { CreateItemUseCase } from './use-cases/create-item.use-case';
import { ListItemsUseCase } from './use-cases/list-items.use-case';
import { GetItemByIdUseCase } from './use-cases/get-item-by-id.use-case';
import { UpdateItemUseCase } from './use-cases/update-item.use-case';
import { DeleteItemUseCase } from './use-cases/delete-item.use-case';
import { CreateOrderUseCase } from './use-cases/create-order.use-case';
import { ListOrdersUseCase } from './use-cases/list-orders.use-case';
import { GetOrderByIdUseCase } from './use-cases/get-order-by-id.use-case';
import { PayOrderUseCase } from './use-cases/pay-order.use-case';
import { AddItemToOrderUseCase } from './use-cases/add-item-to-order.use-case';
import { RemoveItemFromOrderUseCase } from './use-cases/remove-item-from-order.use-case';
import { GenerateItemLabelsUseCase } from './use-cases/generate-item-labels.use-case';
import { GetOrdersSummaryUseCase } from './use-cases/get-orders-summary.use-case';
import { RegisterStockEntryUseCase } from './use-cases/register-stock-entry.use-case';
import { ListStockEntriesUseCase } from './use-cases/list-stock-entries.use-case';
import { GetStockEntryByIdUseCase } from './use-cases/get-stock-entry-by-id.use-case';
import { UpdateStockEntryUseCase } from './use-cases/update-stock-entry.use-case';
import { CreateStockCountUseCase } from './use-cases/create-stock-count.use-case';
import { AddStockCountScanUseCase } from './use-cases/add-stock-count-scan.use-case';
import { FinalizeStockCountUseCase } from './use-cases/finalize-stock-count.use-case';
import { GetStockCountByIdUseCase } from './use-cases/get-stock-count-by-id.use-case';
import { ListStockCountsUseCase } from './use-cases/list-stock-counts.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    GetHelloUseCase,
    CreateItemUseCase,
    ListItemsUseCase,
    GetItemByIdUseCase,
    UpdateItemUseCase,
    DeleteItemUseCase,
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderByIdUseCase,
    PayOrderUseCase,
    AddItemToOrderUseCase,
    RemoveItemFromOrderUseCase,
    GenerateItemLabelsUseCase,
    GetOrdersSummaryUseCase,
    RegisterStockEntryUseCase,
    ListStockEntriesUseCase,
    GetStockEntryByIdUseCase,
    UpdateStockEntryUseCase,
    CreateStockCountUseCase,
    AddStockCountScanUseCase,
    FinalizeStockCountUseCase,
    GetStockCountByIdUseCase,
    ListStockCountsUseCase,
    { provide: GET_HELLO_INBOUND_PORT, useExisting: GetHelloUseCase },
    { provide: CREATE_ITEM_INBOUND_PORT, useExisting: CreateItemUseCase },
    { provide: LIST_ITEMS_INBOUND_PORT, useExisting: ListItemsUseCase },
    { provide: GET_ITEM_BY_ID_INBOUND_PORT, useExisting: GetItemByIdUseCase },
    { provide: UPDATE_ITEM_INBOUND_PORT, useExisting: UpdateItemUseCase },
    { provide: DELETE_ITEM_INBOUND_PORT, useExisting: DeleteItemUseCase },
    { provide: CREATE_ORDER_INBOUND_PORT, useExisting: CreateOrderUseCase },
    { provide: LIST_ORDERS_INBOUND_PORT, useExisting: ListOrdersUseCase },
    { provide: GET_ORDER_BY_ID_INBOUND_PORT, useExisting: GetOrderByIdUseCase },
    { provide: PAY_ORDER_INBOUND_PORT, useExisting: PayOrderUseCase },
    { provide: ADD_ITEM_TO_ORDER_INBOUND_PORT, useExisting: AddItemToOrderUseCase },
    {
      provide: REMOVE_ITEM_FROM_ORDER_INBOUND_PORT,
      useExisting: RemoveItemFromOrderUseCase,
    },
    {
      provide: GENERATE_ITEM_LABELS_INBOUND_PORT,
      useExisting: GenerateItemLabelsUseCase,
    },
    {
      provide: GET_ORDERS_SUMMARY_INBOUND_PORT,
      useExisting: GetOrdersSummaryUseCase,
    },
    {
      provide: REGISTER_STOCK_ENTRY_INBOUND_PORT,
      useExisting: RegisterStockEntryUseCase,
    },
    {
      provide: LIST_STOCK_ENTRIES_INBOUND_PORT,
      useExisting: ListStockEntriesUseCase,
    },
    {
      provide: GET_STOCK_ENTRY_BY_ID_INBOUND_PORT,
      useExisting: GetStockEntryByIdUseCase,
    },
    {
      provide: UPDATE_STOCK_ENTRY_INBOUND_PORT,
      useExisting: UpdateStockEntryUseCase,
    },
    {
      provide: CREATE_STOCK_COUNT_INBOUND_PORT,
      useExisting: CreateStockCountUseCase,
    },
    {
      provide: ADD_STOCK_COUNT_SCAN_INBOUND_PORT,
      useExisting: AddStockCountScanUseCase,
    },
    {
      provide: FINALIZE_STOCK_COUNT_INBOUND_PORT,
      useExisting: FinalizeStockCountUseCase,
    },
    {
      provide: GET_STOCK_COUNT_BY_ID_INBOUND_PORT,
      useExisting: GetStockCountByIdUseCase,
    },
    {
      provide: LIST_STOCK_COUNTS_INBOUND_PORT,
      useExisting: ListStockCountsUseCase,
    },
  ],
  exports: [
    GET_HELLO_INBOUND_PORT,
    CREATE_ITEM_INBOUND_PORT,
    LIST_ITEMS_INBOUND_PORT,
    GET_ITEM_BY_ID_INBOUND_PORT,
    UPDATE_ITEM_INBOUND_PORT,
    DELETE_ITEM_INBOUND_PORT,
    CREATE_ORDER_INBOUND_PORT,
    LIST_ORDERS_INBOUND_PORT,
    GET_ORDER_BY_ID_INBOUND_PORT,
    PAY_ORDER_INBOUND_PORT,
    ADD_ITEM_TO_ORDER_INBOUND_PORT,
    REMOVE_ITEM_FROM_ORDER_INBOUND_PORT,
    GENERATE_ITEM_LABELS_INBOUND_PORT,
    GET_ORDERS_SUMMARY_INBOUND_PORT,
    REGISTER_STOCK_ENTRY_INBOUND_PORT,
    LIST_STOCK_ENTRIES_INBOUND_PORT,
    GET_STOCK_ENTRY_BY_ID_INBOUND_PORT,
    UPDATE_STOCK_ENTRY_INBOUND_PORT,
    CREATE_STOCK_COUNT_INBOUND_PORT,
    ADD_STOCK_COUNT_SCAN_INBOUND_PORT,
    FINALIZE_STOCK_COUNT_INBOUND_PORT,
    GET_STOCK_COUNT_BY_ID_INBOUND_PORT,
    LIST_STOCK_COUNTS_INBOUND_PORT,
  ],
})
export class ApplicationModule {}
