import type { ItemLabelDto } from '../../dto/item-label.dto';
import type { GenerateItemLabelsDto } from '../../dto/generate-item-labels.dto';

/**
 * Porta de entrada (Inbound Port) - Gerar etiquetas para itens cadastrados.
 * Retorna dados para impressão: SKU, preço, código de barras.
 * Permite informar id do produto e quantidade de etiquetas por produto.
 */
export const GENERATE_ITEM_LABELS_INBOUND_PORT =
  Symbol('GenerateItemLabelsInboundPort');

export interface IGenerateItemLabelsInboundPort {
  /**
   * Gera dados de etiquetas para os itens, com quantidade controlada por produto.
   * @param dto Lista de { itemId, quantity }; retorna quantity cópias da etiqueta para cada item.
   * @returns Lista de etiquetas (SKU, price, barcode) — uma entrada por etiqueta a imprimir.
   */
  execute(dto: GenerateItemLabelsDto): Promise<ItemLabelDto[]>;
}
