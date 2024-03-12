import { DataSource } from "typeorm";
import { getConfig, logger } from "../index";
import * as DatabaseEntities from "./entities";

const config = getConfig();

export class PostgresDataSourceSingleton {
  private static dataSource: DataSource;
  private constructor() {}

  public static async getInstance(): Promise<DataSource> {
    logger.info("Fetching postgres datasource instance");
    logger.trace("Config", config);
    if (!PostgresDataSourceSingleton.dataSource) {
      const dataSource = new DataSource({
        type: "postgres",
        host: config.postgresHost,
        port: config.postgresPort,
        username: config.postgresUser,
        password: config.postgresPassword,
        database: config.postgresDatabaseName,
        synchronize: true,
        logging: false,
        extra: {
          ssl: false,
        },
        entities: [
          DatabaseEntities.ScaffoldEntity,
          DatabaseEntities.InventoryEntity,
          DatabaseEntities.OrdersEntity,
          DatabaseEntities.OrderItemEntity,
          DatabaseEntities.PaymentEntity,
          DatabaseEntities.UsersEntity,
          DatabaseEntities.UserCredentialsEntity,
          DatabaseEntities.OrderPriceEntity,
        ],
      });

      const result = await dataSource.initialize();
      if (result.isInitialized) {
        logger.trace("Postgres dataSource successfully initialized");
        PostgresDataSourceSingleton.dataSource = result;
        return PostgresDataSourceSingleton.dataSource;
      } else {
        throw new Error("Failed to initialize Postgres Datasource");
      }
    } else {
      return PostgresDataSourceSingleton.dataSource;
    }
  }
}
