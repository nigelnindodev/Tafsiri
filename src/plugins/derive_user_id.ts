import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";

import { getConfig } from "..";

export interface AuthVaules {
  userId: number | undefined;
}

export const deriveUserId = (options: AuthVaules = { userId: undefined }) => {
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
    /*.onBeforeHandle(async (ctx) => {
      logger.trace("onBeforeHandle Called");
      const { auth } = ctx.cookie;
      const authValue = await ctx.jwt.verify(auth);

      if (!authValue) {
        throw new ServerAuthenticationError();
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
    })*/
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
