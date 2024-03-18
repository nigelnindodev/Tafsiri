import { Elysia, t } from "elysia";
import { DataSource } from "typeorm";
import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";

import {
    processCreateUserRequest,
    processLoginRequest,
} from "../services/auth";
import { MarkedInfoWrapperComponent } from "../components/common/marked_info_wrapper";
import {
    CookieConstansts,
    ServerHxTriggerEvents,
    SwaggerTags,
} from "../services/common/constants";
import { getConfig, logger } from "..";

const authSchemas = {
    processLoginRequestSchema: t.Object({
        username: t.String(),
        password: t.String(),
    }),
    processCreateuserRequestSchema: t.Object({
        username: t.String(),
        password: t.String(),
    }),
};

/**
 * There's some code duplication with adding JWT middleware in here and in the main server.js file,
 * currently happening to get the Typescript compiler to be happy.
 **/
export const authRoutes = (dataSource: DataSource) => {
    const app = new Elysia({ prefix: "/auth" });
    app.use(cookie())
        .use(
            jwt({
                name: "jwt",
                secret: getConfig().jwtSecret,
            })
        )
        .post(
            "/login",
            async (ctx) => {
                const result = await processLoginRequest(
                    dataSource,
                    ctx.body.username,
                    ctx.body.password
                );
                if (result.userEntity === undefined) {
                    return MarkedInfoWrapperComponent(result.errorMessage);
                } else {
                    logger.trace(ctx);
                    // TODO: If in production, should also set up the secure attribute
                    ctx.setCookie(
                        "auth",
                        await ctx.jwt.sign({
                            username: ctx.body.username,
                            userId: result.userEntity.id,
                        }),
                        {
                            httpOnly: true,
                            maxAge: CookieConstansts.maxAge,
                            path: CookieConstansts.path,
                        }
                    );
                    ctx.set.headers["HX-Trigger"] =
                        ServerHxTriggerEvents.LOGIN_STATUS_CHANGE;
                    return "";
                }
            },
            {
                body: authSchemas.processLoginRequestSchema,
                detail: {
                    summary: "Log in",
                    description: "Log in to the application",
                    tags: [SwaggerTags.Auth.name],
                },
            }
        )
        .post(
            "/logout",
            async (ctx) => {
                ctx.setCookie("auth", "", {
                    httpOnly: true,
                    maxAge: 0,
                    path: CookieConstansts.path,
                });
                ctx.set.headers["HX-Trigger"] =
                    ServerHxTriggerEvents.LOGIN_STATUS_CHANGE;
                return "";
            },
            {
                detail: {
                    summary: "Log out",
                    description:
                        "Endpoint is called by from the UI to log out the current user",
                    tags: [SwaggerTags.Auth.name],
                },
            }
        )
        // Most of our route handler functions should finally look like below, not too verbose :-)
        .post(
            "/user/create",
            async (ctx) => {
                return await processCreateUserRequest(
                    dataSource,
                    ctx.body.username,
                    ctx.body.password
                );
            },
            {
                body: authSchemas.processCreateuserRequestSchema,
                detail: {
                    summary: "Create a new user",
                    description:
                        "Use this endpoint to create a new user in the system. By default, the user will not be an admin user.",
                    tags: [SwaggerTags.Auth.name],
                },
            }
        );
    return app;
};
