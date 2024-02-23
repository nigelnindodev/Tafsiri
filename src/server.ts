import "reflect-metadata"; // required for TypeORM

import { DataSource } from "typeorm";
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { IndexPage } from "./components/pages/index_2";
import { inventoryRoutes } from "./routes/inventory";
import { orderRoutes } from "./routes/orders";
import { paymentRoutes } from "./routes/payments";
import { tailWindPlugin } from "./plugins/tailwind";
import { authRoutes } from "./routes/auth";
import { LoginPage } from "./components/pages/auth/login";

/**
 * We're initializing the application server with the DataSource as a parameter so that we can
 * replace the data source with a test database instance, for easier unit testing.
 */
export const createApplicationServer = (dataSource: DataSource) => {
  const app = new Elysia()
    .use(swagger())
    .use(staticPlugin())
    //    .use(tailWindPlugin())
    .use(jwt({
      name: "jwt",
      secret: "notSoSecretForTesting"
    }))
    .use(html())
    // Ensures that all 500 errors are logged for API routes 
    // TODO: Should we also log third party errors and add this middleware at the top? Seems like a solid idea.
    .onError(({ code, error }) => {
      console.error(`API error occured with code [${code}]: ${error}`);
    })
    .use(authRoutes(dataSource))
    .use(inventoryRoutes(dataSource))
    .use(orderRoutes(dataSource))
    .use(paymentRoutes(dataSource))
    .get("/", async (ctx) => {
      const { auth } = ctx.cookie;
      const authValue = await ctx.jwt.verify(auth.value);
      console.log("authValue", authValue);
      if (!authValue) {
        return LoginPage();
      } else {
        return IndexPage(authValue.username.toString());
      }
    });
  return app;
};
