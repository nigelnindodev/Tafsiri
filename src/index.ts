import "reflect-metadata"; // required for TypeORM

import { PostgresDataSourceSingleton } from "./postgres";
import { createApplicationServer } from "./server";
import { ILogObj, Logger } from "tslog";

/**
 * Application configuration object.
 * Values here are to be read from an .env file. Bun has built in support for env files.
 */
export interface Config {
  applicationPort: number;
  baseUrl: string;
  jwtSecret: string;
  postgresUser: string;
  postgresPassword: string;
  postgresHost: string;
  postgresPort: number;
  postgresDatabaseName: string;
}

/**
 * Helper function that fetches reads applicaion config values and returns it as a `Config`
 * object.
 */
export function getConfig(): Config {
  return {
    applicationPort: Number(process.env.APPLICATION_PORT) || 3000,
    baseUrl: process.env.BASE_URL || "",
    jwtSecret: process.env.JWT_SECRET || "not_cool",
    postgresUser: process.env.POSTGRES_USER || "",
    postgresPassword: process.env.POSTGRES_PASSWORD || "",
    postgresHost: process.env.POSTGRES_HOST || "",
    postgresPort: Number(process.env.POSTGRES_PORT) || 5432,
    postgresDatabaseName: process.env.POSTGRES_DATABASE_NAME || "",
  };
}

export const logger: Logger<ILogObj> = new Logger({
  type: "pretty",
  name: "mainLogger",
});

// Bun automatically masks sensitive password fields
logger.info("App Configuration", getConfig());

/**
 * Initialize Postgres database connector, to be passed on to the application server creator.
 */
const dataSource = await PostgresDataSourceSingleton.getInstance();

/**
 * Create the application server, passing in the TypeORM data source.
 */
const app = createApplicationServer(dataSource);

app.listen(getConfig().applicationPort);

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} with NODE_ENV ${process.env.NODE_ENV}`,
);
