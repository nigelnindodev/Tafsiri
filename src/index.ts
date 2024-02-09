import "reflect-metadata";

import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { newIndexPage } from "./html_components/pages/root/index_2";
import { nameResult } from "./html_components/name_result";
import { PostgresDataSourceSingleton } from "./postgres";
import { picoPage } from "./html_components/pico_example";
import { OrdersPage } from "./html_components/pages/root/orders";
import { PaymentsPage } from "./html_components/pages/root/payments";
import { InventoryPage } from "./html_components/pages/root/inventory";
import { CreateInventorySection } from "./html_components/pages/root/inventory/create";
import { ViewInventorySection } from "./html_components/pages/root/inventory/inventory";
import { createInventoryItem, listInventoryItems } from "./services/inventory";

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

const dataSource = await PostgresDataSourceSingleton.getInstance();

const app = new Elysia()
  .use(swagger())
  .use(staticPlugin())
  .use(html())
  .get("/html", () => {
    return newIndexPage;
  })
  .post("/name", () => {
    return nameResult;
  })
  .get("/inventory", () => {
    return InventoryPage;
  })
  .get("inventory/create", () => {
    return CreateInventorySection;
  })
  .get("inventory/list", () => {
    return ViewInventorySection;
  })
  .get("inventory/list/all", async () => {
    return await listInventoryItems(dataSource);
  })
  .post("/inventory/create", async (ctx) => {
    console.log(ctx);
    const result = await createInventoryItem(dataSource, ctx.body.name, Number(ctx.body.price));
    return result;
  })
  .get("/orders", () => {
    return OrdersPage;
  })
  .get("/payments", () => {
    return PaymentsPage;
  })
  .get("/pico", () => {
    return picoPage;
  })
  .get("/", () => {
    return "Hello Elysia";
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
