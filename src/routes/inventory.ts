import Elysia from "elysia"
import { CreateInventorySection } from "../components/pages/inventory/create";
import { ViewInventorySection } from "../components/pages/inventory/inventory";
import { DataSource } from "typeorm";
import { createInventoryItem, listInventoryItemOrders, listInventoryItems, searchInventoryItems } from "../services/inventory";
import { InventoryPage } from "../components/pages/inventory";

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
      const searchTerm = ctx.query.search;
      if (searchTerm === "") {
        return await listInventoryItems(dataSource);
      } else {
        return await searchInventoryItems(dataSource, searchTerm);
      }
    })
    .get("/orders/:inventoryId", async (ctx) => {
      return await listInventoryItemOrders(dataSource, Number(ctx.params.inventoryId));
    })
    .post("/create", async (ctx) => {
      return await createInventoryItem(dataSource, ctx.body.name, Number(ctx.body.price));
    });
  return app;
} 
