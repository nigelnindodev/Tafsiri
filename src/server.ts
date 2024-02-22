import "reflect-metadata"; // required for TypeORM

import { DataSource } from "typeorm";
import { Elysia } from "elysia";
import { jwt} from "@elysiajs/jwt";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { IndexPage} from "./components/pages/index_2";
import { inventoryRoutes } from "./routes/inventory";
import { orderRoutes } from "./routes/orders";
import { paymentRoutes } from "./routes/payments";
import { tailWindPlugin } from "./plugins/tailwind";
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
    .get("/setjwt", async (ctx) => {
      console.log(ctx); 
      const {auth} = ctx.cookie;
      auth.set({
        httpOnly: true, // very important to prevent front end javascript accessing the cookie
        value: await ctx.jwt.sign({username: "admin"}),
        maxAge: 60 * 2
      });
      return "Set JWT";
    })
    .get("/getjwt", (ctx) => {
      console.log(ctx);
      return "Get JWT";
    })
    .use(inventoryRoutes(dataSource))
    .use(orderRoutes(dataSource))
    .use(paymentRoutes(dataSource))
    .get("/", async (ctx) => {
      console.log(ctx);
      const {auth} = ctx.cookie;
      const authValue = await ctx.jwt.verify(auth.value);
      console.log(authValue);
      if (!authValue) {
        return LoginPage();
      } else {
        return IndexPage();
      }
    });
  return app;
};
