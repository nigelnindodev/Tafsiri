import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

import { getConfig, logger } from "..";
import { CookieConstansts } from "../services/common/constants";

export interface AuthVaules {
  userId: number | undefined;
}

/**
 * A nice feature of the auth plugin is it doesn't affect any other routes defined
 * outside of the Elysia app instance we call it in.
 *
 * The implication is we can add authentication in a particular route application,
 * without the authPlugin affecting any other applications defined after it.
 */
export const authPlugin = (options: AuthVaules = { userId: undefined }) => {
  const app = new Elysia({
    seed: options,
  });
  app
    .use(cookie())
    .use(
      jwt({
        name: "jwt",
        secret: getConfig().jwtSecret,
      }),
    )
    .onBeforeHandle(async (ctx) => {
      const { auth } = ctx.cookie;
      const authValue = await ctx.jwt.verify(auth);

      if (!authValue) {
        ctx.set.status = "Unauthorized";
        ctx.set.redirect = "/";
      } else {
        ctx.setCookie(
          "auth",
          await ctx.jwt.sign({
            username: authValue.username,
            userId: authValue.userId,
          }),
          {
            httpOnly: true,
            maxAge: CookieConstansts.maxAge,
            path: CookieConstansts.path,
          },
        );
        logger.trace("authValueUserId", authValue.userId);
        app.state("userId", authValue.userId);
      }
    })
    /**
     * We expect onBeforeHandle method above to handle canceling and redirect before
     * the server handles the request, os we shouldn't be using an undefined userId
     * in the routes using this plugin.
     *
     * We need the derive call to add the userid to the context for the routes, thus not
     * having to check the JWT on every API endpoint.
     */
    .derive(async (ctx) => {
      const { auth } = ctx.cookie;
      const authValue = await ctx.jwt.verify(auth);
      if (!authValue) {
        return {
          userId: undefined,
        };
      } else {
        return {
          userId: authValue.userId,
        };
      }
    });
  return app;
};
