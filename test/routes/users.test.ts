import { describe, expect, test } from "bun:test";
import { PostgresDataSourceSingleton } from "../../src/postgres";
import { createApplicationServer } from "../../src/server";
import { getTestBaseUrl, loginUser, loginUserAdmin } from "../test_utils";
import { testAdminUser, testUser } from "../test_constants";

describe("Users routes file endpoints", async () => {
    const dataSource = await PostgresDataSourceSingleton.getInstance();
    const app = createApplicationServer(dataSource);
    const baseUrls = getTestBaseUrl(app);

    // Create an admin and non admin user
    const loggedInCookie = await loginUser(app, testUser);
    const loggedInCokkieAdmin = await loginUserAdmin(
        dataSource,
        app,
        testAdminUser
    );

    describe("GET on /users endpoint", () => {
        describe("User session inactive", async () => {});

        describe("User session active", async () => {
            describe("Non-admin user", async () => {});

            describe("Admin user", async () => {});
        });
    });

    describe("GET on /users/list endpoint", () => {
        describe("User session inactive", async () => {});

        describe("User session active", async () => {
            describe("Non-admin user", async () => {});

            describe("Admin user", async () => {});
        });
    });

    describe("GET on /users/:userId endpoint", () => {
        describe("User session inactive", async () => {});

        describe("User session active", async () => {
            describe("Non-admin user", async () => {});

            describe("Admin user", async () => {});
        });
    });

    describe("POST on /users/toggleActive/:userId endpoint", () => {
        describe("User session inactive", async () => {});

        describe("User session active", async () => {
            describe("Non-admin user", async () => {});

            describe("Admin user", async () => {});
        });
    });
});
