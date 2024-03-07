import Elysia from "elysia";
import { DataSource } from "typeorm";
import { z } from "zod";

import { authPlugin } from "../plugins/auth";
import { getUser, listUsers, updateUser } from "../services/users";
import { RequestNumberSchema } from "../services/common/constants";
import { UsersPage } from "../components/pages/users";
import { logger } from "..";

const usersSchema = {
  getuserParams: z.object({
    userId: RequestNumberSchema,
  }),
  updateUserParams: z.object({
    userId: RequestNumberSchema,
  }),
  updateUserBody: z.object({
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
    .post("/:userId", async (ctx) => {
      return await updateUser(dataSource, 1);
    });
  return app;
};
