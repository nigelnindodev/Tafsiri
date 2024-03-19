import Elysia from "elysia";
import { DataSource } from "typeorm";

import { TestUser } from "./test_constants.ts";
import { upgradeUserToAdmin } from "../src/postgres/queries";

export const getTestBaseUrl = (app: Elysia): string => {
    return `http://${app.server?.hostname || "localhost"}:${app.server?.port || 3000}`;
};

/**
 * This function handles an edge case where cheerio is failing to get the hx-post
 * value from some input elements.
 *
 * Cannot use DOMParser as this is not supported in Bun: https://github.com/oven-sh/bun/discussions/1522
 *
 * Bun also doesn't have great regex support, so we'll have to come up with our own implementation
 * to resolve getting the hx-post value.
 */
export const getHxPostValueInput = (markup: string): string | undefined => {
    const splitMarkup = markup.split(" ");
    const hxPostSection = splitMarkup.filter((section) => {
        return section.startsWith("hx-post");
    });

    if (hxPostSection.length === 1) {
        /**
         * We should now have a value like 'hx-post="{target_value}"'
         *
         * Split the string by equals sign then slice to remove the double quotes
         */
        const result = hxPostSection[0].split("=")[1].slice(1, -1);
        return result;
    } else {
        // no hx-post found, or more than one found
        return undefined;
    }
};

/**
 * Logs in the test user and returns a the cookie value as a string
 * to be added in requests.
 */
export const loginUser = async (
    app: Elysia,
    user: { username: string; password: string }
): Promise<string> => {
    const baseUrl = getTestBaseUrl(app);
    // Fine if fails because test user is already created
    await app.handle(
        new Request(`${baseUrl}/auth/user/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        })
    );

    const loginResponse = await app.handle(
        new Request(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        })
    );

    if (loginResponse.status !== 200) {
        throw new Error(
            `Failed to log in test user: ${await loginResponse.text()}`
        );
    }

    const cookieValue = loginResponse.headers.get("set-cookie")?.split(";")[0];

    if (cookieValue === undefined) {
        throw new Error(
            `Failed to read cookie value from headers. Headers: ${loginResponse.headers}`
        );
    }

    return cookieValue;
};

export const loginUserAdmin = async (
    dataSource: DataSource,
    app: Elysia,
    user: TestUser
): Promise<string> => {
    const result = await loginUser(app, user);
    await upgradeUserToAdmin(dataSource, user.username);
    return result;
};
