/**
 * Produto vendido no resumo (agregado por itemId).
 */
export interface ProductSoldDto {
  /** ID do produto (item). */
  itemId: string;
  /** Nome do produto (snapshot da venda). */
  productName: string;
  /** Quantidade total vendida no período. */
  quantitySold: number;
  /** Valor total (soma dos subtotais das linhas desse produto). */
  totalAmount: number;
}

/**
 * Linha de venda: um produto vendido em uma comanda (para PDF com Nº comanda ao lado do produto).
 */
export interface SalesLineDto {
  /** Número da comanda (ex.: COM-0001). */
  comandaNumber: string;
  /** Nome do produto. */
  productName: string;
  /** Quantidade vendida nessa linha. */
  quantitySold: number;
  /** Valor total da linha (subtotal). */
  totalAmount: number;
}

/** Totais de vendas por forma de pagamento (apenas comandas PAID). */
export interface TotalsByPaymentMethodDto {
  PIX: number;
  MONEY: number;
  CREDIT_CARD: number;
  DEBIT_CARD: number;
}

/**
 * DTO de saída do resumo de comandas por dia.
 * Contabiliza somente comandas com status PAID (paga).
 */
export interface OrderSummaryDto {
  /** Data do resumo (YYYY-MM-DD). */
  date: string;
  /** Quantidade total de comandas pagas no dia. */
  totalOrders: number;
  /** Valor total das comandas pagas no dia. */
  totalValue: number;
  /** Valor total de vendas por forma de pagamento. */
  totalsByPaymentMethod: TotalsByPaymentMethodDto;
  /** Números das comandas incluídas no resumo (ex.: COM-0001, COM-0002). */
  comandaNumbers: string[];
  /** Produtos vendidos no dia (agregado por produto, somente comandas pagas). */
  productsSold: ProductSoldDto[];
  /** Linhas de venda: cada item vendido com a comanda a que pertence (para PDF). */
  salesLines: SalesLineDto[];
}
