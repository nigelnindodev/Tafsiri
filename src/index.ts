import "reflect-metadata";

import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { indexPage } from "./html_components/index";
import { nameResult } from "./html_components/name_result";
import { PostgresDataSourceSingleton } from "./postgres";

export interface Config {
  postgresUser: string;
  postgresPassword: string;
  postgressHost: string;
  postgresPort: number;
  postgresDatabaseName: string;
}

export function getConfig(): Config {
  return {
    postgresUser: process.env.POSTGRES_USER || "",
    postgresPassword: process.env.POSTGRES_PASSWORD || "",
    postgressHost: process.env.POSTGRES_HOST || "",
    postgresPort: Number(process.env.POSTGRES_PORT) || 5432,
    postgresDatabaseName: process.env.POSTGRES_DATABASE_NAME || ""
  }
};

await PostgresDataSourceSingleton.getInstance();

const app = new Elysia()
  //.use(swagger())
  /*.use(staticPlugin())
  .use(html())
  .get("/html", () => {
    return indexPage;
  })
  .post("/name", () => {
    return nameResult;
  })*/
  /*.get("/inventory", (ctx) => {
    console.log(ctx);
    return "Hello inventory";
  })*/
  .get("/inventory", (ctx) => {
    console.log(ctx); 
    return JSON.stringify([
      {
        a: 1,
        b: 2
      }
    ]);
  })
  /*.get("/orders", ({params: {_start, _end}}) => {
    console.log(`Orders start: ${_start} | Orders end: ${_end}`);
    return JSON.stringify([
      {
        a: 1,
        b: 2
      }
    ]);
  })*/
  .get("/", () => {
    return "Hello Elysia";
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
