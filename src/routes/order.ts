import {Elysia,t} from "elysia";

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
  ServerHxTriggerEvents,
  SwaggerTags,
} from "../services/common/constants";
import { authPlugin } from "../plugins/auth";
import { logger } from "..";

const orderSchema = {
  activeOrdersParams: t.Object({
    orderId: t.Numeric(),
  }),
  resumeOrderParams: t.Object({
    orderId: t.Numeric(),
  }),
  confirmOrderParams: t.Object({
    orderId: t.Numeric(),
    paymentId: t.Numeric(),
  }),
  updateItemCounterParams: t.Object({
    itemId: t.Numeric(),
    updateType: t.String(),
  }),
  addOrRemoveItemParams: t.Object({
    orderId: t.Numeric(),
    inventoryId: t.Numeric(),
  }),
  updatePaymentTypeForOrderBody: t.Object({
    paymentType:  t.String() // z.nativeEnum(PaymentTypes),
  }),
  updatePaymentTypeForOrderParams: t.Object({
    paymentId: t.Numeric(),
  }),
};

export const orderRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/orders" });
  app
    //.use(authPlugin())
    .get("/", () =>  OrdersPage, {
      detail: {
        summary: "Get Orders Page",
        description: "Return HTMX markup for the main orders page, which by default will load the latest unfinished orders from the /orders/list component",
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
          description: "Returns HTMX markup on clicking of create new order button in the UI. Creates a new order in an initialized state, and if not completed, will be immediately available in the lst of recent unfinished orders",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .get("/list", () => {
      return ViewOrdersSection;
    }, {
        detail: {
          summary: "Get Orders View Component",
          description: "Returns HTMX view markup for the latest unfinshed orders. On load, makes a request to /orders/list/all component to fetch the list view markup for unfinshed orders",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .get("/list/all", async () => {
      return await listUnfinishedOrders(dataSource);
    }, {
        detail: {
          summary: "Get Orders List Component",
          description: "Returns HTMX list view markup for the latest unfinshed orders",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .get("/resume/:orderId", async (ctx) => {
      if ("userId" in ctx) {
        const { userId } = ctx;
        return await resumeOrder(
          dataSource,
          ctx.params.orderId,
          userId as number,
        );
      } else {
        const message = "Failed to get userId of currently logged in user";
        logger.error(message);
        throw new Error(message);
      }
    }, {
        params: orderSchema.resumeOrderParams,
        detail: {
          summary: "Get Resume Order Component",
          description: "From the list view of unfinshed orders, this endpoint call be called by pressing the resume button, which then loads HTMX markup to resume the order",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .post("/confirm/:orderId/:paymentId", async (ctx) => {
      return await confirmOrder(
        dataSource,
        ctx.params.orderId,
        ctx.params.paymentId,
      );
    }, {
        params: orderSchema.confirmOrderParams,
        detail: {
          summary: "Confirm Order",
          description: "Endpoint is called by pressing the confirm button on an order. This returns HTMX success/error markup, which will the load back to the main orders screen after a preconfigured delay",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .post("/item/updateQuantity/:itemId/:updateType", async (ctx) => {
      const result = await updateItemCounter(
        dataSource,
        ctx.params.itemId,
        ctx.params.updateType,
      );
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    }, {
        params: orderSchema.updateItemCounterParams,
        detail: {
          summary: "Update Item Quantity In Order",
          description: "Endpoint is called from the UI during an active order processing. This updates the items quantity and sends a HTMX refresh order event to get the updated counters and total amount due",
          tags: [SwaggerTags.Orders.name]
        } 
      })
    .post("/item/change/:orderId/:inventoryId", async (ctx) => {
      const result = await addOrRemoveOrderItem(
        dataSource,
        ctx.params.orderId,
        ctx.params.inventoryId,
      );
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    }, {
        params: orderSchema.addOrRemoveItemParams,
        detail: {
          summary: "Add/Remove Item In Order",
          description: "Endpoint is called from the UI during active order processing, This is updates the items to add or remove an inventory item and the sends a HTMX refresh order event to  get updated order items and amount due",
          tags: [SwaggerTags.Orders.name]
        }
      })
    .post("/payment/updateType/:paymentId", async (ctx) => {
      const result = await updatePaymentTypeForOrder(
        dataSource,
        ctx.params.paymentId,
        ctx.body.paymentType as PaymentTypes, // TODO: Get rid of this type coercion before merging
      );
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.REFRESH_ORDER;
      return result;
    }, {
        body: orderSchema.updatePaymentTypeForOrderBody,
        params: orderSchema.updatePaymentTypeForOrderParams,
        detail: {
          summary: "Update Payment Type",
          description: "Updates the payment type for the Order. In the UI, this endpoint is called by selecting the payment type radio button during an active order. Also sends a HTMX refresh order event to update the UI with the correct payment type.",
          tags: [SwaggerTags.Orders.name]
        }
      });
  return app;
};
