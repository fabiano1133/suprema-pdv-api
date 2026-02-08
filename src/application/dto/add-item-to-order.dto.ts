import { IsString, IsNumber, Min } from 'class-validator';

/**
 * DTO de entrada para adicionar um item a uma comanda.
 */
export class AddItemToOrderDto {
  @IsString()
  itemId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}
