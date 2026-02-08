/**
 * Porta de saída (Outbound Port) - Arquitetura Hexagonal.
 * Interface que o domínio/aplicação define; a infraestrutura implementa.
 * Exemplo genérico de repositório.
 */
export interface IRepositoryPort<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}
