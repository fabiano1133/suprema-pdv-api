import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO de entrada para o use case de criar Order (abrir venda).
 * Venda inicia vazia (status OPEN, total 0); itens são adicionados depois.
 */
export class CreateOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  client?: string;
}
