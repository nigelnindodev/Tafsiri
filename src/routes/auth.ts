import Elysia from "elysia";
import { DataSource } from "typeorm";
import { jwt } from "@elysiajs/jwt";
import { z } from "zod";

import { LoginPage } from "../components/pages/auth/login";
import { IndexPage } from "../components/pages/index_2";
import { processLoginRequest } from "../services/auth";

/**
 * There's some code dupliation with adding JWT middleware twice, currently happening
 * to get the TypeScript transpiler to be happy. We'll fix this later.
 *
 * Also the logic for the root ("/") controller is duplicated here, so that will have to
 * be fixed as well.
 * This duplication helps handle the scenario of where on the browser url bar ("/auth/login") 
 * is directly accessed. We can then ensure that if the user is logged in we cna return them
 * to the home screen, instead of having them log in again.
 */

const authSchemas = {
  loginSchema: z.object({
    username: z.string(),
    password: z.string()
  })
};

export const authRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/auth" });
  app
    .use(jwt({
      name: "jwt",
      secret: "notSoSecretForTesting"
    }))
    .get("/login", async (ctx) => {
      const { auth } = ctx.cookie;
      const authValue = await ctx.jwt.verify(auth.value);
      if (!authValue) {
        return LoginPage();
      } else {
        return IndexPage();
      }
    })
    // TODO: Update to usa basic auth
    /**
     * Trying to avoid more type gymnastics for now for parsing the JWT context to the service
     * method for login, so a little bit of the logic will creep in to the router.
     */
    .post("/login", async (ctx) => {
      const validateresult = authSchemas.loginSchema.parse(ctx.body);
      const result = await processLoginRequest(dataSource, validateresult.username, validateresult.password);
      if (result.success === false) {
        return result.errorMessage;
      } else {
        const { auth } = ctx.cookie;
        auth.set({
          httpOnly: true,
          value: await ctx.jwt.sign({ username: validateresult.username }),
          maxAge: 60 * 5
        });
        // this redirect now loads the main application page since the JWT cookie is now set
        ctx.set.redirect = "/";
        return "";
      }
    });
  return app;
};
