import "reflect-metadata"; // required for TypeORM

import { DataSource } from "typeorm";
import { Elysia } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { IndexComponent } from "./components/pages/index_component";
import { inventoryRoutes } from "./routes/inventory";
import { orderRoutes } from "./routes/orders";
import { paymentRoutes } from "./routes/payments";
import { authRoutes } from "./routes/auth";
import { LoginComponent } from "./components/pages/auth/login";
import { getUserByUsernameWithCredentials } from "./postgres/queries";
import { OrderExampleTailwindComponent } from "./components/pages/orders/order_tailwind";
import { RootPage } from "./components/pages/root_page";

/**
 * We're initializing the application server with the DataSource as a parameter so that we can
 * replace the data source with a test database instance, for easier unit testing.
 */
export const createApplicationServer = (dataSource: DataSource) => {
  const app = new Elysia()
    .use(cookie())
    .use(swagger())
    .use(staticPlugin())
    .use(jwt({
      name: "jwt",
      secret: "notSoSecretForTesting"
    }))
    .use(html())
    // Ensures that all 500 errors are logged for API routes 
    // TODO: Should we also log third party errors and add this middleware at the top? Seems like a solid idea.
    .onError(({ code, error }) => {
      console.error(`API error occured with code [${code}]: ${error.message} ${error.cause} ${error.stack}`);
    })
    .get("/tailwind", () => {
      return OrderExampleTailwindComponent();
    })
    .use(authRoutes(dataSource))
    .use(inventoryRoutes(dataSource))
    .use(orderRoutes(dataSource))
    .use(paymentRoutes(dataSource))
    .get("/", () => {
      return RootPage();
    })
    .get("/root", async (ctx) => {
      console.log(ctx);
      const { auth } = ctx.cookie;
      if (!auth) {
        return LoginComponent();
      }
      const authValue = await ctx.jwt.verify(auth);
      console.log("authValue", authValue);
      if (!authValue) {
        return LoginComponent();
      } else {
        const user = await getUserByUsernameWithCredentials(dataSource, authValue.username.toString());
        if (user === null) {
          return LoginComponent();
        } else {
          return IndexComponent(user);
        }
      }
    });
  return app;
};
