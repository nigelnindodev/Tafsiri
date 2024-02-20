import Elysia from "elysia";
import { z } from "zod";

import { DataSource } from "typeorm";
import { OrdersPage } from "../components/pages/orders";
import { activeOrders, addOrRemoveOrderItem, confirmOrder, createOrder, listUnfinishedOrders, resumeOrder, updateItemCounter, updatePaymentTypeForOrder } from "../services/orders";
import { ViewOrdersSection } from "../components/pages/orders/orders";
import { PaymentTypes } from "../postgres/common/constants";
import { ServerHxTriggerEvents } from "../services/common/constants";

const orderSchema = {
  activeOrdersParams: z.object({
    orderId: z.number()
  }),
  resumeOrderParams: z.object({
    orderId: z.number()
  }),
  confirmOrderParams: z.object({
    orderId: z.number(),
    paymentId: z.number()
  }),
  updateItemCounterParams: z.object({
    itemId: z.number(),
    updateType: z.string().length(3)
  }),
  addOrRemoveItemParams: z.object({
    orderId: z.number(),
    inventoryId: z.number()
  }),
  updatePaymentTypeForOrderBody: z.object({
    paymentType: z.nativeEnum(PaymentTypes)
  }),
  updatePaymentTypeForOrderParams: z.object({
    paymentId: z.number()
  })
};

export const orderRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/orders" });
  app
    .get("/", () => {
      return OrdersPage;
    })
    .get("/active/:orderId", async (ctx) => {
      const validateResult = orderSchema.activeOrdersParams.parse(ctx.params);
      return await activeOrders(dataSource, validateResult.orderId);
    })
    .get("/create", async () => {
      return await createOrder(dataSource);
    })
    .get("/list", () => {
      return ViewOrdersSection;
    })
    .get("/list/all", async () => {
      //TODO: Change "all" to "unfinished"
      return await listUnfinishedOrders(dataSource);
    })
    .get("/resume/:orderId", async (ctx) => {
      const validateResult = orderSchema.resumeOrderParams.parse(ctx.params);
      return await resumeOrder(dataSource, validateResult.orderId);
    })
    .post("/confirm/:orderId/:paymentId", async (ctx) => {
      const validateResult = orderSchema.confirmOrderParams.parse(ctx.params);
      return await confirmOrder(dataSource, validateResult.orderId, validateResult.paymentId);
    })
    .post("/item/updateQuantity/:itemId/:updateType", async (ctx) => {
      const validateResult = orderSchema.updateItemCounterParams.parse(ctx.params);
      const result = await updateItemCounter(dataSource, validateResult.itemId, validateResult.updateType);
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    })
    .post("/item/change/:orderId/:inventoryId", async (ctx) => {
      const validateResult = orderSchema.addOrRemoveItemParams.parse(ctx.params);
      const result = await addOrRemoveOrderItem(dataSource, validateResult.orderId, validateResult.inventoryId);
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    })
    .post("/payment/updateType/:paymentId", async (ctx) => {
      const validateBodyResult = orderSchema.updatePaymentTypeForOrderBody.parse(ctx.body);
      const validateParamsResult = orderSchema.updatePaymentTypeForOrderParams.parse(ctx.params);
      const result = await updatePaymentTypeForOrder(dataSource, validateParamsResult.paymentId, validateBodyResult.paymentType);
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    });
  return app;
};
