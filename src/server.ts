import "reflect-metadata"; // required for TypeORM

import { DataSource } from "typeorm";
import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { newIndexPage } from "./components/pages/index_2";
import { inventoryRoutes } from "./routes/inventory";
import { orderRoutes } from "./routes/orders";
import { paymentRoutes } from "./routes/payments";

/**
 * We're initializing the application server with the DataSource as a parameter so that we can
 * easily replace the data source with a test database instance.
 */
export const createApplicationServer = (dataSource: DataSource) => {
  const app = new Elysia()
    .use(swagger())
    .use(staticPlugin())
    .use(html())
    .use(inventoryRoutes(dataSource))
    .use(orderRoutes(dataSource))
    .use(paymentRoutes(dataSource))
    .get("/", () => {
      return newIndexPage;
    });
  return app;
};
