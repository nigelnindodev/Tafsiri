import Elysia from "elysia";
import { DataSource } from "typeorm";

export const authRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/auth" });
  app
    .get("/login", (ctx) => {

    })
    .post("/login", (ctx) => {

    });
  return app;
};
