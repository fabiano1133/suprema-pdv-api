import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ItemOrmEntity } from './typeorm.entities/item.orm-entity';
import { OrderOrmEntity } from './typeorm.entities/order.orm-entity';
import { StockEntryOrmEntity } from './typeorm.entities/stock-entry.orm-entity';
import { StockCountOrmEntity } from './typeorm.entities/stock-count.orm-entity';

const db = {
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'suprema_pdv',
};

export default new DataSource({
  type: 'postgres',
  ...(typeof db.url === 'string' && db.url.length > 0
    ? { url: db.url }
    : {
        host: db.host,
        port: db.port,
        username: db.username,
        password: db.password,
        database: db.database,
      }),
  entities: [
    ItemOrmEntity,
    OrderOrmEntity,
    StockEntryOrmEntity,
    StockCountOrmEntity,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',
  logging: process.env.DB_LOGGING === 'true',
});
