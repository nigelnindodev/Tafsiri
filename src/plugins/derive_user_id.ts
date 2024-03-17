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
