import "reflect-metadata";

import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { newIndexPage } from "./components/pages/index_2";
import { nameResult } from "./components/name_result";
import { PostgresDataSourceSingleton } from "./postgres";
import { picoPage } from "./components/pico_example";
import { OrdersPage } from "./components/pages/orders";
import { PaymentsPage } from "./components/pages/payments";
import { InventoryPage } from "./components/pages/inventory";
import { CreateInventorySection } from "./components/pages/inventory/create";
import { ViewInventorySection } from "./components/pages/inventory/inventory";
import { createInventoryItem, listInventoryItems, searchInventoryItems } from "./services/inventory";
import { ViewOrdersSection } from "./components/pages/orders/orders";
import { activeOrders, createOrder, listOrders, updateItemCounter, updateOrderItem, updatePaymentTypeForOrder } from "./services/orders";
import { PaymentTypes } from "./postgres/common/constants";

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
  .get("inventory/list/search", async (ctx) => {
    const searchTerm = ctx.query.search;
    if (searchTerm === "") {
      return await listInventoryItems(dataSource);
    } else {
      return await searchInventoryItems(dataSource, searchTerm);
    }
  })
  .post("/inventory/create", async (ctx) => {
    const result = await createInventoryItem(dataSource, ctx.body.name, Number(ctx.body.price));
    return result;
  })
  .get("/orders", () => {
    return OrdersPage;
  })
  .get("/orders/create", () => {
    return createOrder(dataSource);
  })
  .get("/orders/active/:orderId", (ctx) => {
    return activeOrders(dataSource, Number(ctx.params.orderId));
  })
  .get("/orders/list", () => {
    return ViewOrdersSection;
  })
  .get("/orders/list/all", () => {
    return listOrders(dataSource);
  })
  .post("/orders/confirm/orderId", () => {

  })
  .post("/orders/item/updateQuantity/:itemId/:updateType", (ctx) => {
    return updateItemCounter(dataSource, Number(ctx.params.itemId), ctx.params.updateType);
  })
  .post("/orders/item/change/:orderId/:inventoryId", (ctx) => {
    return updateOrderItem(dataSource, Number(ctx.params.orderId), Number(ctx.params.inventoryId));
  })
  .post("/orders/payment/updateType/:paymentId", (ctx) => {
    const paymentTypeString = ctx.body.paymentType as string;
    return updatePaymentTypeForOrder(dataSource, Number(ctx.params.paymentId), paymentTypeString.toUpperCase() as PaymentTypes);
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
