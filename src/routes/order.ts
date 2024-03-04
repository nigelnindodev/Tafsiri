import Elysia from "elysia";
import { z } from "zod";

import { DataSource } from "typeorm";
import { OrdersPage } from "../components/pages/orders";
import {
  activeOrders,
  addOrRemoveOrderItem,
  confirmOrder,
  createOrder,
  listUnfinishedOrders,
  resumeOrder,
  updateItemCounter,
  updatePaymentTypeForOrder,
} from "../services/orders";
import { ViewOrdersSection } from "../components/pages/orders/orders";
import { PaymentTypes } from "../postgres/common/constants";
import {
  RequestNumberSchema,
  ServerHxTriggerEvents,
} from "../services/common/constants";
import { authPlugin } from "../plugins/auth";
import { logger } from "..";

const orderSchema = {
  activeOrdersParams: z.object({
    orderId: RequestNumberSchema,
  }),
  resumeOrderParams: z.object({
    orderId: RequestNumberSchema,
  }),
  confirmOrderParams: z.object({
    orderId: RequestNumberSchema,
    paymentId: RequestNumberSchema,
  }),
  updateItemCounterParams: z.object({
    itemId: RequestNumberSchema,
    updateType: z.string().length(3),
  }),
  addOrRemoveItemParams: z.object({
    orderId: RequestNumberSchema,
    inventoryId: RequestNumberSchema,
  }),
  updatePaymentTypeForOrderBody: z.object({
    paymentType: z.nativeEnum(PaymentTypes),
  }),
  updatePaymentTypeForOrderParams: z.object({
    paymentId: RequestNumberSchema,
  }),
};

export const orderRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/orders" });
  app
    .use(authPlugin())
    .get("/", () => {
      return OrdersPage;
    })
    .get("/active/:orderId", async (ctx) => {
      const validateResult = orderSchema.activeOrdersParams.parse(ctx.params);
      return await activeOrders(dataSource, validateResult.orderId);
    })
    .get("/create", async (ctx) => {
      logger.trace("Create order ctx", ctx);
      /**
       * TODO: The destructuring above works, but we need to find a way to add it to the
       * ctx's type.
       */
      const {userId} = ctx;
      return await createOrder(dataSource, userId);
    })
    .get("/list", () => {
      return ViewOrdersSection;
    })
    .get("/list/all", async () => {
      return await listUnfinishedOrders(dataSource);
    })
    .get("/resume/:orderId", async (ctx) => {
      const validateResult = orderSchema.resumeOrderParams.parse(ctx.params);
      const {userId} = ctx;
      return await resumeOrder(dataSource, validateResult.orderId, userId);
    })
    .post("/confirm/:orderId/:paymentId", async (ctx) => {
      const validateResult = orderSchema.confirmOrderParams.parse(ctx.params);
      return await confirmOrder(
        dataSource,
        validateResult.orderId,
        validateResult.paymentId,
      );
    })
    .post("/item/updateQuantity/:itemId/:updateType", async (ctx) => {
      const validateResult = orderSchema.updateItemCounterParams.parse(
        ctx.params,
      );
      const result = await updateItemCounter(
        dataSource,
        validateResult.itemId,
        validateResult.updateType,
      );
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    })
    .post("/item/change/:orderId/:inventoryId", async (ctx) => {
      const validateResult = orderSchema.addOrRemoveItemParams.parse(
        ctx.params,
      );
      const result = await addOrRemoveOrderItem(
        dataSource,
        validateResult.orderId,
        validateResult.inventoryId,
      );
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    })
    .post("/payment/updateType/:paymentId", async (ctx) => {
      const validateBodyResult =
        orderSchema.updatePaymentTypeForOrderBody.parse(ctx.body);
      const validateParamsResult =
        orderSchema.updatePaymentTypeForOrderParams.parse(ctx.params);
      const result = await updatePaymentTypeForOrder(
        dataSource,
        validateParamsResult.paymentId,
        validateBodyResult.paymentType,
      );
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    });
  return app;
};
