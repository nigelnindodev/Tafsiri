import { getConfig, logger } from ".";
import { PostgresDataSourceSingleton } from "./postgres";
import { createApplicationServer } from "./server";

export const startServer = async () => {
  logger.trace("Starting Server");
  const dataSource = await PostgresDataSourceSingleton.getInstance();

  const app = createApplicationServer(dataSource);

  app.listen(getConfig().applicationPort);

  logger.info(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} with NODE_ENV ${process.env.NODE_ENV}`,
  );
};
