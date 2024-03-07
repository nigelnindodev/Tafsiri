import Elysia from "elysia";
import { DataSource } from "typeorm";
import { z } from "zod";

import { authPlugin } from "../plugins/auth";
import { getUser, listUsers, toggleUserActiveState } from "../services/users";
import { RequestNumberSchema } from "../services/common/constants";
import { UsersPage } from "../components/pages/users";
import { logger } from "..";

const usersSchema = {
  getuserParams: z.object({
    userId: RequestNumberSchema,
  }),
  toggleUserActiveStateParams: z.object({
    userId: RequestNumberSchema,
  }),
};

export const usersRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/users" });
  app
    .use(authPlugin())
    .get("/", () => UsersPage)
    .get("/list", async () => {
      return await listUsers(dataSource);
    })
    .get("/:userId", async (ctx) => {
      logger.trace("Get user by id endpoint called");
      const validateResult = usersSchema.getuserParams.parse(ctx.params);
      return await getUser(dataSource, validateResult.userId);
    })
    .post("/toggleActive/:userId", async (ctx) => {
      const validateResult = usersSchema.toggleUserActiveStateParams.parse(
        ctx.params,
      );
      return await toggleUserActiveState(dataSource, validateResult.userId);
    });
  return app;
};
