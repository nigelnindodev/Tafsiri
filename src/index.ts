import "reflect-metadata"; // required for TypeORM

import { PostgresDataSourceSingleton } from "./postgres";
import { createApplicationServer } from "./server";

/**
 * Application configuration object. 
 * Values here are to be read from an .env file. Bun has built in support for env files.
 * TODO: Purge the local .env file from source control [IMPORTANT]
 */
export interface Config {
  postgresUser: string;
  postgresPassword: string;
  postgresHost: string;
  postgresPort: number;
  postgresDatabaseName: string;
}

export function getConfig(): Config {
  return {
    postgresUser: process.env.POSTGRES_USER || "",
    postgresPassword: process.env.POSTGRES_PASSWORD || "",
    postgresHost: process.env.POSTGRES_HOST || "",
    postgresPort: Number(process.env.POSTGRES_PORT) || 5432,
    postgresDatabaseName: process.env.POSTGRES_DATABASE_NAME || ""
  }
};

const dataSource = await PostgresDataSourceSingleton.getInstance();
const app = createApplicationServer(dataSource);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} with NODE_ENV ${process.env.NODE_ENV}`
);
