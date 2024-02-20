import Elysia from "elysia";
import { z } from "zod";

import { CreateInventorySection } from "../components/pages/inventory/create";
import { ViewInventorySection } from "../components/pages/inventory/inventory";
import { DataSource } from "typeorm";
import { createInventoryItem, listInventoryItemOrders, listInventoryItems, searchInventoryItems } from "../services/inventory";
import { InventoryPage } from "../components/pages/inventory";

const inventorySchemas = {
  seacrhInventoryItemsQuery: z.object({
    search: z.string()
  }),
  createInventoryItemBody: z.object({
    name: z.string(),
    price: z.number()
  })
};

export const inventoryRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/inventory" });
  app
    .get("/", () => InventoryPage)
    .get("/create", () => CreateInventorySection)
    .get("/list", () => ViewInventorySection)
    .get("/list/all", async () => {
      return await listInventoryItems(dataSource)
    })
    .get("/list/search", async (ctx) => {
      const validateResult = inventorySchemas.seacrhInventoryItemsQuery.parse(ctx.query);
      if (validateResult.search === "") {
        return await listInventoryItems(dataSource);
      } else {
        console.log("Schema result:", validateResult);
        return await searchInventoryItems(dataSource, validateResult.search);
      }
    })
    .get("/orders/:inventoryId", async (ctx) => {
      return await listInventoryItemOrders(dataSource, Number(ctx.params.inventoryId));
    })
    .post("/create", async (ctx) => {
      const validateResult = inventorySchemas.createInventoryItemBody.parse(ctx.body);
      return await createInventoryItem(dataSource, validateResult.name, validateResult.price);
    });
  return app;
} 
