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
import { ViewOrdersSection } from "./components/pages/orders/orders";
import { activeOrders, addOrRemoveOrderItem, confirmOrder, createOrder, listUnfinishedOrders, resumeOrder, updateItemCounter, updatePaymentTypeForOrder } from "./services/orders";
import { PaymentTypes } from "./postgres/common/constants";
import { listPayments } from "./services/payments";
import { ServerHxTriggerEvents } from "./services/common/constants";
import { inventoryRoutes} from "./routes/inventory";

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

let app = new Elysia()
  .use(swagger())
  .use(staticPlugin())
  .use(html())
  .get("/html", () => {
    return newIndexPage;
  })
  .post("/name", () => {
    return nameResult;
  })
  .use(inventoryRoutes(dataSource))
  .get("/orders", () => {
    return OrdersPage;
  })
  .get("/orders/create", async () => {
    return await createOrder(dataSource);
  })
  .get("/orders/resume/:orderId", async (ctx) => {
    return await resumeOrder(dataSource, Number(ctx.params.orderId));
  })
  .get("/orders/active/:orderId", async (ctx) => {
    return await activeOrders(dataSource, Number(ctx.params.orderId));
  })
  .get("/orders/list", () => {
    return ViewOrdersSection;
  })
  .get("/orders/list/all", async () => {
    //TODO: Change "all" to "unfinished"
    return await listUnfinishedOrders(dataSource);
  })
  .post("/orders/confirm/:orderId/:paymentId", async (ctx) => {
    return await confirmOrder(dataSource, Number(ctx.params.orderId), Number(ctx.params.paymentId));
  })
  .post("/orders/item/updateQuantity/:itemId/:updateType", async (ctx) => {
    const result = await updateItemCounter(dataSource, Number(ctx.params.itemId), ctx.params.updateType);
    ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
    return result;
  })
  .post("/orders/item/change/:orderId/:inventoryId", async (ctx) => {
    const result = await addOrRemoveOrderItem(dataSource, Number(ctx.params.orderId), Number(ctx.params.inventoryId));
    ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
    return result;
  })
  .post("/orders/payment/updateType/:paymentId", async (ctx) => {
    const paymentTypeString = ctx.body.paymentType as string;
    const result = await updatePaymentTypeForOrder(dataSource, Number(ctx.params.paymentId), paymentTypeString.toUpperCase() as PaymentTypes);
    ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
    return result;
  })
  .get("/payments", () => {
    return PaymentsPage;
  })
  .get("payments/list", async () => {
    return await listPayments(dataSource);
  })
  .get("/pico", () => {
    return picoPage;
  })
  .get("/", () => {
    return "Hello Elysia";
  });

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
