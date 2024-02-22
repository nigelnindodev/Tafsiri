import Elysia from "elysia";
import { DataSource } from "typeorm";
import { jwt } from "@elysiajs/jwt";

import { LoginPage } from "../components/pages/auth/login";
import { IndexPage } from "../components/pages/index_2";

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
export const authRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/auth" });
  app.use(jwt({
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
    .post("/login", (ctx) => {

    });
  return app;
};
