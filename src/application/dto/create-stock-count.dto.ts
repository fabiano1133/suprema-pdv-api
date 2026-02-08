import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

/**
 * DTO de entrada para iniciar uma nova conferência/balanço.
 * Balanço inicia vazio (status IN_PROGRESS); o usuário bipa os produtos e depois finaliza.
 * Código interno (ex: BAL-001) é gerado automaticamente.
 */
export class CreateStockCountDto {
  @IsString()
  @MinLength(1, { message: 'name não pode ser vazio' })
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
