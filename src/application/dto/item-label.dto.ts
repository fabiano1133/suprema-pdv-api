/**
 * DTO de saída para etiqueta de item (impressão: SKU, preço, nome, código de barras).
 */
export interface ItemLabelDto {
  /** Nome do produto (exibição na etiqueta, abaixo do preço). */
  name: string;
  /** SKU do produto. */
  sku: string;
  /** Preço de venda (para exibição na etiqueta). */
  price: number;
  /** Código de barras (para impressão/leitura). */
  barcode: string;
  /** Código do fornecedor (ex.: no layout 26x15x3 é exibido abaixo do código de barras). */
  supplierCode: string;
}
