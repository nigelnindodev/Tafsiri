import { describe, expect, test } from "bun:test";
import { PostgresDataSourceSingleton } from "../../src/postgres";
import { createApplicationServer } from "../../src/server";
import { getTestBaseUrl, loginUser, loginUserAdmin } from "../test_utils";
import { testAdminUser, testUser } from "../test_constants";

describe("Users routes file endpoints", async () => {
    const dataSource = await PostgresDataSourceSingleton.getInstance();
    const app = createApplicationServer(dataSource);
    const baseUrl = getTestBaseUrl(app);

    // Create an admin and non admin user
    const loggedInCookie = await loginUser(app, testUser);
    const loggedInCokkieAdmin = await loginUserAdmin(
        dataSource,
        app,
        testAdminUser
    );

    console.log("loggedInCookie value:", loggedInCookie);

    describe("GET on /users endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(new Request(`${baseUrl}/users`));

            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", async () => {
            describe("Non-admin user", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}/users`, {
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );

                test("returns 403 status code", () => {
                    expect(response.status).toBe(403);
                });
            });

            describe("Admin user", async () => {});
        });
    });

    describe("GET on /users/list endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/users/list`)
            );

            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", async () => {
            describe("Non-admin user", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}/users/list`, {
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );

                test("Returns 403 status code", () => {
                    expect(response.status).toBe(403);
                });
            });

            describe("Admin user", async () => {});
        });
    });

    describe("GET on /users/:userId endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/users/1`)
            );

            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", async () => {
            describe("Non-admin user", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}/users/1`, {
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );

                test("Returns 403 status code", () => {
                    expect(response.status).toBe(403);
                });
            });

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
