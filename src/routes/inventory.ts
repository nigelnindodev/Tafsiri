import { Elysia, t } from "elysia";

import { CreateOrUpdateInventoryComponent } from "../components/pages/inventory/create_or_update_inventory_item";
import { ViewInventoryComponent } from "../components/pages/inventory/inventory";
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
import { SwaggerTags } from "../services/common/constants";
import { forbidIfNotAdmin } from "./utils";

const inventorySchemas = {
  searchInventoryItemsQuery: t.Object({
    search: t.String(),
  }),
  createInventoryItemBody: t.Object({
    name: t.String(),
    price: t.Numeric(),
  }),
  updateInventoryItemBody: t.Object({
    name: t.String(),
    price: t.Numeric(),
  }),
};

export const inventoryRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/inventory" });
  app.guard(
    {
      beforeHandle: async (ctx) => {
        await forbidIfNotAdmin(dataSource, ctx);
      },
    },
    (app) =>
      app
        .get("/", () => InventoryPage, {
          detail: {
            summary: "Get Inventory Page",
            description:
              "Returns HTMX markup for the main inventory page, which by default loads a searchable list of inventory items by calling the /inventory/list endpoint",
            tags: [SwaggerTags.Inventory.name],
          },
        })
        .get("/create", () => CreateOrUpdateInventoryComponent(), {
          detail: {
            summary: "Get Create Inventory Component",
            description:
              "Returns HTMX markup for adding a new item in the inventory",
            tags: [SwaggerTags.Inventory.name],
          },
        })
        .get(
          "/edit/:inventoryId",
          async (ctx) => {
            return await getInventoryItemForUpdate(
              dataSource,
              ctx.params.inventoryId,
            );
          },
          {
            params: t.Object({
              inventoryId: t.Numeric(),
            }),
            detail: {
              summary: "Get Update Inventory Item Component",
              description:
                "Returns HTMX markup for updating an inventory item after fetching its details",
              tags: [SwaggerTags.Inventory.name],
            },
          },
        )
        .get("/list", () => ViewInventoryComponent(), {
          detail: {
            summary: "Get Inventory View Componenet",
            description:
              "Returns HTMX markup that includes views for searching inventory, and where on loaded call /list/all endpoint to display the inventory items",
            tags: [SwaggerTags.Inventory.name],
          },
        })
        .get(
          "/list/all",
          async () => {
            return await listInventoryItems(dataSource);
          },
          {
            detail: {
              summary: "Get Inventory Items List Component",
              description:
                "Returns HTMX list items markup for displaying inventory items",
              tags: [SwaggerTags.Inventory.name],
            },
          },
        )
        .get(
          "/list/search",
          async (ctx) => {
            if (ctx.params.search === "") {
              return await listInventoryItems(dataSource);
            } else {
              return await searchInventoryItems(dataSource, ctx.params.search);
            }
          },
          {
            params: inventorySchemas.searchInventoryItemsQuery,
            detail: {
              summary: "Get Inventory Search Results Component",
              description:
                "Returns HTMX markup with filtered inventory items. If search is empty, returns all the inventory items.",
              tags: [SwaggerTags.Inventory.name],
            },
          },
        )
        .get(
          "/orders/:inventoryId",
          async (ctx) => {
            return await listInventoryItemOrders(
              dataSource,
              ctx.params.inventoryId,
            );
          },
          {
            params: t.Object({
              inventoryId: t.Numeric(),
            }),
            detail: {
              summary: "Get Inventory Orders Component",
              description:
                "Returns HTMX markup that displays all the orders that a particular inventory item has been added to",
              tags: [SwaggerTags.Inventory.name],
            },
          },
        )
        .post(
          "/create",
          async (ctx) => {
            return await createInventoryItem(
              dataSource,
              ctx.body.name,
              ctx.body.price,
            );
          },
          {
            body: inventorySchemas.createInventoryItemBody,
            detail: {
              summary: "Create Inventory Item",
              description:
                "Adds a new inventory item, and returns HTMX markup indicating success or error",
              tags: [SwaggerTags.Inventory.name],
            },
          },
        )
        .post(
          "/edit/:inventoryId",
          async (ctx) => {
            return await updateInventoryItem(
              dataSource,
              ctx.params.inventoryId,
              ctx.body.name,
              ctx.body.price,
            );
          },
          {
            body: inventorySchemas.updateInventoryItemBody,
            params: t.Object({
              inventoryId: t.Numeric(),
            }),
            detail: {
              summary: "Edit Inventory Item",
              description:
                "Edits a inventory item, and returns HTMX markup indicating success or error",
              tags: [SwaggerTags.Inventory.name],
            },
          },
        ),
  );
  return app;
};
