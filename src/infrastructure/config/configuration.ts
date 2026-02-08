/**
 * Configuração centralizada da aplicação (segurança e escalabilidade).
 * Variáveis lidas de process.env; em produção use .env e valide com schema.
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  /** Origens permitidas no CORS. Em produção use lista explícita (ex: "https://app.empresa.com"). */
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : true,
  /** Prefixo global da API (ex: /api). */
  globalPrefix: process.env.GLOBAL_PREFIX ?? 'api',

  /** Caminho para a logo da loja (resumo PDF). Relativo ao cwd ou absoluto. Opcional. */
  storeLogoPath: process.env.STORE_LOGO_PATH ?? undefined,

  /** Driver de persistência: in_memory (padrão) | postgres */
  persistenceDriver: process.env.PERSISTENCE_DRIVER ?? 'in_memory',

  /** Configuração do banco (PostgreSQL) para TypeORM. */
  db: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'suprema_pdv',
    /** Dev/test: cria/atualiza schema automaticamente. Em produção use false e migrations. */
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    /** Em produção (NODE_ENV=production) ou com DB_MIGRATIONS=true: roda migrations na subida. */
    logging: process.env.DB_LOGGING === 'true',
  },
});
