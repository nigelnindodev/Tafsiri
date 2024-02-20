import Elysia from "elysia";
import { DataSource } from "typeorm";
import { OrdersPage } from "../components/pages/orders";
import { activeOrders, addOrRemoveOrderItem, confirmOrder, createOrder, listUnfinishedOrders, resumeOrder, updateItemCounter, updatePaymentTypeForOrder } from "../services/orders";
import { ViewOrdersSection } from "../components/pages/orders/orders";
import { PaymentTypes } from "../postgres/common/constants";
import { ServerHxTriggerEvents } from "../services/common/constants";

export const orderRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/orders" })
  app
    .get("/", () => {
      return OrdersPage;
    })
    .get("/create", async () => {
      return await createOrder(dataSource);
    })
    .get("/resume/:orderId", async (ctx) => {
      return await resumeOrder(dataSource, Number(ctx.params.orderId));
    })
    .get("/active/:orderId", async (ctx) => {
      return await activeOrders(dataSource, Number(ctx.params.orderId));
    })
    .get("/list", () => {
      return ViewOrdersSection;
    })
    .get("/list/all", async () => {
      //TODO: Change "all" to "unfinished"
      return await listUnfinishedOrders(dataSource);
    })
    .post("/confirm/:orderId/:paymentId", async (ctx) => {
      return await confirmOrder(dataSource, Number(ctx.params.orderId), Number(ctx.params.paymentId));
    })
    .post("/item/updateQuantity/:itemId/:updateType", async (ctx) => {
      const result = await updateItemCounter(dataSource, Number(ctx.params.itemId), ctx.params.updateType);
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    })
    .post("/item/change/:orderId/:inventoryId", async (ctx) => {
      const result = await addOrRemoveOrderItem(dataSource, Number(ctx.params.orderId), Number(ctx.params.inventoryId));
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    })
    .post("/payment/updateType/:paymentId", async (ctx) => {
      const paymentTypeString = ctx.body.paymentType as string;
      const result = await updatePaymentTypeForOrder(dataSource, Number(ctx.params.paymentId), paymentTypeString.toUpperCase() as PaymentTypes);
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    });
  return app;
};
