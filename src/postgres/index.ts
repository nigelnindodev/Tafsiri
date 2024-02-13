import { DataSource } from "typeorm";
import { getConfig } from "..";
import { InventoryEntity, OrderEntity, OrderItemEntity, PaymentEntity, ScaffoldEntity } from "./entities";

const config = getConfig();

export class PostgresDataSourceSingleton {
  private static dataSource: DataSource;
  private constructor() { }

  public static async getInstance(): Promise<DataSource> {
    if (!PostgresDataSourceSingleton.dataSource) {
      const dataSource = new DataSource({
        type: "postgres",
        host: config.postgressHost,
        port: config.postgresPort,
        username: config.postgresUser,
        password: config.postgresPassword,
        database: config.postgresDatabaseName,
        synchronize: true,
        logging: false,
        extra: {
          ssl: false
        },
        entities: [
          ScaffoldEntity,
          InventoryEntity,
          OrderEntity,
          OrderItemEntity,
          PaymentEntity
        ]
      });

      const result = await dataSource.initialize();
      if (result.isInitialized) {
        PostgresDataSourceSingleton.dataSource = result;
        return PostgresDataSourceSingleton.dataSource;
      } else {
        throw new Error("Failed to initialize Postgres Datasource");
      }
    } else {
      return PostgresDataSourceSingleton.getInstance();
    }
  }
}
