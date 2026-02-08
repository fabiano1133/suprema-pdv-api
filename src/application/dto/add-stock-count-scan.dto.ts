import { IsString, IsNumber, Min } from 'class-validator';

/**
 * DTO de entrada para adicionar uma bipagem ao balanço (produto + quantidade contada).
 * Se o produto já foi bipado, a quantidade é somada.
 */
export class AddStockCountScanDto {
  @IsString()
  itemId!: string;

  /** Quantidade contada (bipagem). Pode ser 1 por bip ou acumulada. */
  @IsNumber()
  @Min(0)
  quantity!: number;
}
