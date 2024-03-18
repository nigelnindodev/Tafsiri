import { Elysia, t } from "elysia";
import { DataSource } from "typeorm";

import { getUser, listUsers, toggleUserActiveState } from "../services/users";
import { UsersPage } from "../components/pages/users";
import { logger } from "..";
import { SwaggerTags } from "../services/common/constants";

const usersSchema = {
    getuserParams: t.Object({
        userId: t.Numeric(),
    }),
    toggleUserActiveStateParams: t.Object({
        userId: t.Numeric(),
    }),
};

export const usersRoutes = (dataSource: DataSource) => {
    const app = new Elysia({ prefix: "/users" });
    app.get("/", () => UsersPage, {
        detail: {
            summary: "Get Users Page",
            description:
                "Returns HTMX markup for the main users page, which by default will load the list of users from the /users/list endpoint",
            tags: [SwaggerTags.Users.name],
        },
    })
        .get(
            "/list",
            async () => {
                return await listUsers(dataSource);
            },
            {
                detail: {
                    summary: "Get Users List Component",
                    description:
                        "Returns HTMX markup that lists all application users",
                    tags: [SwaggerTags.Users.name],
                },
            }
        )
        .get(
            "/:userId",
            async (ctx) => {
                logger.trace("Get user by id endpoint called");
                return await getUser(dataSource, ctx.params.userId);
            },
            {
                params: usersSchema.getuserParams,
                detail: {
                    summary: "Get User Details Component",
                    description:
                        "Fetches HTMX markup for displayer a users details given their userId as the parameter",
                    tags: [SwaggerTags.Users.name],
                },
            }
        )
        .post(
            "/toggleActive/:userId",
            async (ctx) => {
                return await toggleUserActiveState(
                    dataSource,
                    ctx.params.userId
                );
            },
            {
                params: usersSchema.toggleUserActiveStateParams,
                detail: {
                    summary: "Toggle User Active State",
                    description:
                        "Toggles if a user is active or not given their userId as the parameter. Note that admin users cannot be de-activated wit this endpoint",
                    tags: [SwaggerTags.Users.name],
                },
            }
        );
    return app;
};
