# Migrations (TypeORM) — ambiente produtivo

Em produção, o schema do banco **não** é alterado com `synchronize`. Use **migrations**.

## Comportamento

- **Desenvolvimento** (`NODE_ENV=development` e `DB_SYNCHRONIZE=true`): o TypeORM pode criar/atualizar tabelas automaticamente (útil para dev).
- **Produção** (`NODE_ENV=production`): `synchronize` fica desligado e as **migrations são executadas na subida da aplicação** (`migrationsRun: true`).
- Opcional: em qualquer ambiente, defina `DB_MIGRATIONS=true` para forçar a execução de migrations na subida (e desligar synchronize).

## Comandos

```bash
# Rodar migrations (build + execução)
npm run migration:run

# Reverter a última migration
npm run migration:revert

# Gerar nova migration a partir das entidades (requer DB acessível)
npm run migration:generate
```

Antes de `migration:run` e `migration:generate` o projeto é compilado (`npm run build`). As migrations ficam em:

`src/infrastructure/persistence/typeorm/migrations/`

## Primeira implantação em produção

1. Configure as variáveis de banco (`DB_*` ou `DATABASE_URL`).
2. Garanta que o Postgres está no ar.
3. Suba a API (ex.: `npm run start:prod` ou container). Na primeira subida, as migrations serão aplicadas antes do app escutar requisições.
4. Ou rode manualmente antes: `npm run migration:run`.

## Adicionar novas migrations

1. Altere ou crie entidades em `src/infrastructure/persistence/typeorm/typeorm.entities/`.
2. Gere a migration: `npm run migration:generate` (renomeie o arquivo gerado se quiser).
3. Ou crie um arquivo manualmente em `migrations/` implementando `MigrationInterface` (métodos `up` e `down`).
4. Rode `npm run migration:run` para aplicar.
