import Elysia from "elysia";
import { DataSource } from "typeorm";
import { jwt } from "@elysiajs/jwt";
import { z } from "zod";

import { LoginPage } from "../components/pages/auth/login";
import { IndexPage } from "../components/pages/index_2";
import { processCreateUserRequest, processLoginRequest } from "../services/auth";

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
  processLoginRequestSchema: z.object({
    username: z.string(),
    password: z.string()
  }),
  processCreateuserRequestSchema: z.object({
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
    // TODO: Update to usa basic auth
    /**
     * Trying to avoid more type gymnastics for now (would be required for the 
     * `processLoginRequest` method to understand jwt functionality is available), so a bit of the logic will creep in to the router.
     * Not the most ideal as what we were going after as the core function of the router is to 
     * determine which service methods will handle the request based on the route, and that's wehre the business logic should live. However, for now this seems it will lead to some really hard to understand type annotations on the service method. We will find a workaround though.
     */
    .post("/login", async (ctx) => {
      const validateresult = authSchemas.processLoginRequestSchema.parse(ctx.body);
      const result = await processLoginRequest(dataSource, validateresult.username, validateresult.password);
      if (result.success === false) {
        return result.errorMessage;
      } else {
        const { auth } = ctx.cookie;
        auth.set({
          httpOnly: true,
          value: await ctx.jwt.sign({ username: validateresult.username }),
          maxAge: 60 * 5, // 5 minute session (short for testing purposes)
          path: "/"
        });
        return IndexPage(validateresult.username);
      }
    })
    // Most of our routes should like below, not too verbose :-)
    .post("/user/create", async (ctx) => {
      //console.log(ctx);
      //const parsedBody = JSON.parse(ctx.request.body);
      //console.log("JSON", parsedBody);
      console.log(ctx.body);
      const validateResult = authSchemas.processCreateuserRequestSchema.parse(ctx.body);
      return await processCreateUserRequest(dataSource, validateResult.username, validateResult.password);
    });
  return app;
};
