import "reflect-metadata"; // required for TypeORM

import { ILogObj, Logger } from "tslog";
import { startServer } from "./start_server";

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
 * Helper function that fetches reads application config values and returns it as a `Config`
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

// TODO: Must be a beeter way to prevent duplicate server start for testing.
if (process.env.NODE_ENV !== "test") {
  await startServer();
}
