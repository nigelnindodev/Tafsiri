import Elysia from "elysia";
import { z } from "zod";

import { CreateOrUpdateInventoryComponent } from "../components/pages/inventory/create_or_update_inventory_item";
import { ViewInventorySection } from "../components/pages/inventory/inventory";
import { DataSource } from "typeorm";
import {
  createInventoryItem,
  getInventoryItemForUpdate,
  listInventoryItemOrders,
  listInventoryItems,
  searchInventoryItems,
  updateInventoryItem,
} from "../services/inventory";
import { InventoryPage } from "../components/pages/inventory";
import { RequestNumberSchema } from "../services/common/constants";
import { logger } from "..";
import { authPlugin } from "../plugins/auth";

const inventorySchemas = {
  searchInventoryItemsQuery: z.object({
    search: z.string(),
  }),
  createInventoryItemBody: z.object({
    name: z.string(),
    price: RequestNumberSchema,
  }),
  updateInventoryItemBody: z.object({
    name: z.string(),
    price: RequestNumberSchema,
  }),
};

export const inventoryRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/inventory" });
  app
    .use(authPlugin())
    .get("/", () => InventoryPage, {
      detail: {
        summary: "Get Inventory Page",
        description:
          "Returns HTMX markup for the main inventory page, which by default loads a searchable list of inventory items by calling the /inventory/list endpoint.",
      },
    })
    .get("/create", () => CreateOrUpdateInventoryComponent(), {
      detail: {
        summary: "Get Create Inventory Section",
        description:
          "Returns HTMX markup for adding a new item in the inventory",
      },
    })
    .get(
      "/edit/:inventoryId",
      async (ctx) => {
        return await getInventoryItemForUpdate(
          dataSource,
          Number(ctx.params.inventoryId),
        );
      },
      {
        detail: {
          summary: "Get Edit Inventory Item Section",
          description:
            "Returns HTMX markup for editing an inventory item  after fetching it's details",
        },
      },
    )
    .get("/list", () => ViewInventorySection, {
      detail: {
        summary: "",
        description: "",
      },
    })
    .get(
      "/list/all",
      async () => {
        return await listInventoryItems(dataSource);
      },
      {
        detail: {
          summary: "",
          description: "",
        },
      },
    )
    .get("/list/search", async (ctx) => {
      const validateResult = inventorySchemas.searchInventoryItemsQuery.parse(
        ctx.query,
      );
      if (validateResult.search === "") {
        return await listInventoryItems(dataSource);
      } else {
        return await searchInventoryItems(dataSource, validateResult.search);
      }
    })
    .get("/orders/:inventoryId", async (ctx) => {
      return await listInventoryItemOrders(
        dataSource,
        Number(ctx.params.inventoryId),
      );
    })
    .post("/create", async (ctx) => {
      const validateResult = inventorySchemas.createInventoryItemBody.parse(
        ctx.body,
      );
      return await createInventoryItem(
        dataSource,
        validateResult.name,
        validateResult.price,
      );
    })
    .post("/edit/:inventoryId", async (ctx) => {
      logger.info(ctx);
      const validateResult = inventorySchemas.createInventoryItemBody.parse(
        ctx.body,
      );
      return await updateInventoryItem(
        dataSource,
        Number(ctx.params.inventoryId),
        validateResult.name,
        validateResult.price,
      );
    });
  return app;
};
