import { DataSource } from "typeorm";
import { Elysia } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { IndexComponent } from "./components/pages/index_component";
import { inventoryRoutes } from "./routes/inventory";
import { orderRoutes } from "./routes/order";
import { paymentRoutes } from "./routes/payments";
import { authRoutes } from "./routes/auth";
import { LoginComponent } from "./components/pages/auth/login";
import { getUserByUsernameWithCredentials } from "./postgres/queries";
import { RootPage } from "./components/pages/root_page";
import { getConfig, logger } from ".";
import { usersRoutes } from "./routes/users";
import { SwaggerTags } from "./services/common/constants";

/**
 * We're initializing the application server with the DataSource as a parameter so that we can
 * replace the data source with a test database instance, for easier unit testing.
 */
export const createApplicationServer = (dataSource: DataSource) => {
  const app = new Elysia()
    .use(cookie())
    .use(
      // Maybe move the swagger plugin into its own file?
      swagger({
        documentation: {
          info: {
            title: "Tafsiri Swagger Specification",
            version: "0.0.2-alpha",
          },
          tags: [
            SwaggerTags.Auth,
            SwaggerTags.Inventory,
            SwaggerTags.Orders,
            SwaggerTags.Payments,
            SwaggerTags.Users,
          ],
        },
      }),
    )
    .use(staticPlugin())
    .use(
      jwt({
        name: "jwt",
        secret: getConfig().jwtSecret,
      }),
    )
    .use(html())
    // Ensures that all 500 errors are logged for API routes
    // TODO: Should we also log third party errors and add this middleware at the top? Seems like a solid idea.
    .onError(({ code, error }) => {
      logger.error(
        `API error occured with code [${code}]: ${error.message} ${error.cause} ${error.stack}`,
      );
    })
    .use(authRoutes(dataSource))
    .use(inventoryRoutes(dataSource))
    .use(orderRoutes(dataSource))
    .use(paymentRoutes(dataSource))
    .use(usersRoutes(dataSource))
    .get("/", () => {
      return RootPage();
    })
    .get("/root", async (ctx) => {
      logger.trace("Application context on root path", ctx);
      const { auth } = ctx.cookie;
      if (!auth) {
        return LoginComponent();
      }
      const authValue = await ctx.jwt.verify(auth);
      logger.trace("authValue", authValue);
      if (!authValue) {
        return LoginComponent();
      } else {
        const user = await getUserByUsernameWithCredentials(
          dataSource,
          authValue.username.toString(),
        );
        if (user === null) {
          return LoginComponent();
        } else {
          return IndexComponent(user);
        }
      }
    });
  return app;
};
