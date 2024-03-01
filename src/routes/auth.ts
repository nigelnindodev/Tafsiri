import Elysia from "elysia";
import { DataSource } from "typeorm";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { z } from "zod";

import {
  processCreateUserRequest,
  processLoginRequest,
} from "../services/auth";
import { MarkedInfoWrapperComponent } from "../components/common/marked_info_wrapper";
import {
  CookieConstansts,
  ServerHxTriggerEvents,
} from "../services/common/constants";

const authSchemas = {
  processLoginRequestSchema: z.object({
    username: z.string(),
    password: z.string(),
  }),
  processCreateuserRequestSchema: z.object({
    username: z.string(),
    password: z.string(),
  }),
};

/**
 * There's some code duplication with adding JWT middleware in here and in the main server.js file,
 * currently happening to get the Typescript compiler to be happy.
 **/
export const authRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/auth" });
  app
    .use(cookie())
    .use(
      jwt({
        name: "jwt",
        secret: "notSoSecretForTesting",
      }),
    )
    // TODO: Update to use basic authentication instead of passing username & password in request body?
    .post("/login", async (ctx) => {
      const validateresult = authSchemas.processLoginRequestSchema.parse(
        ctx.body,
      );
      const result = await processLoginRequest(
        dataSource,
        validateresult.username,
        validateresult.password,
      );
      if (result.success === false) {
        return MarkedInfoWrapperComponent(result.errorMessage);
      } else {
        console.log(ctx);
        // TODO: If in production, should also set up the secure attribute
        ctx.setCookie(
          "auth",
          await ctx.jwt.sign({ username: validateresult.username }),
          {
            httpOnly: true,
            maxAge: CookieConstansts.maxAge,
            path: CookieConstansts.path,
          },
        );
        ctx.set.headers["HX-Trigger"] =
          ServerHxTriggerEvents.LOGIN_STATUS_CHANGE;
        return "";
      }
    })
    .post("/logout", async (ctx) => {
      ctx.setCookie("auth", "", {
        httpOnly: true,
        maxAge: 0,
        path: CookieConstansts.path,
      });
      ctx.set.headers["HX-Trigger"] = ServerHxTriggerEvents.LOGIN_STATUS_CHANGE;
      return "";
    })
    // Most of our route handler functions should finally look like below, not too verbose :-)
    .post("/user/create", async (ctx) => {
      const validateResult = authSchemas.processCreateuserRequestSchema.parse(
        ctx.body,
      );
      return await processCreateUserRequest(
        dataSource,
        validateResult.username,
        validateResult.password,
      );
    });
  return app;
};
