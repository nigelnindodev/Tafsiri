import {Elysia,t} from "elysia";
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
  SwaggerTags,
} from "../services/common/constants";
import { authPlugin } from "../plugins/auth";
import { logger } from "..";

const orderSchema = {
  activeOrdersParams: t.Object({
    orderId: t.Number(),
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
    .get("/", () =>  OrdersPage, {
      detail: {
        summary: "Get Orders Page",
        description: "TBA",
        tags: [SwaggerTags.Orders.name]
      } 
    })
    .get("/active/:orderId", async (ctx) => {
      return await activeOrders(dataSource, ctx.params.orderId);
    }, {
        params: orderSchema.activeOrdersParams, 
        detail: {
          summary: "Get Active Order Component",
          description: "TBA",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .get("/create", async (ctx) => {
      logger.trace("Create order ctx", ctx);
      /**
       * If userId is in the ctx, it should be a number.
       * If type guard fails, then throw an error.
       */
      if ("userId" in ctx) {
        const { userId } = ctx;
        return await createOrder(dataSource, userId as number);
      } else {
        const message = "Failed to get userId of currently logged in user";
        logger.error(message);
        throw new Error(message);
      }
    }, {
        detail: {
          summary: "Get Create Order Component",
          description: "TBA",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .get("/list", () => {
      return ViewOrdersSection;
    }, {
        detail: {
          summary: "Get Orders View Component",
          description: "TBA",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .get("/list/all", async () => {
      return await listUnfinishedOrders(dataSource);
    }, {
        detail: {
          summary: "Get Orders List Component",
          description: "TBA",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .get("/resume/:orderId", async (ctx) => {
      const validateResult = orderSchema.resumeOrderParams.parse(ctx.params);
      if ("userId" in ctx) {
        const { userId } = ctx;
        return await resumeOrder(
          dataSource,
          validateResult.orderId,
          userId as number,
        );
      } else {
        const message = "Failed to get userId of currently logged in user";
        logger.error(message);
        throw new Error(message);
      }
    }, {
        detail: {
          summary: "Get Resume Order Component",
          description: "TBA",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .post("/confirm/:orderId/:paymentId", async (ctx) => {
      const validateResult = orderSchema.confirmOrderParams.parse(ctx.params);
      return await confirmOrder(
        dataSource,
        validateResult.orderId,
        validateResult.paymentId,
      );
    }, {
        detail: {
          summary: "Confirm Order",
          description: "TBA",
          tags: [SwaggerTags.Orders.name]
        }
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
