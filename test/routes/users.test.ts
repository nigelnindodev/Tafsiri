import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";

import { PostgresDataSourceSingleton } from "../../src/postgres";
import { createApplicationServer } from "../../src/server";
import { getTestBaseUrl, loginUser, loginUserAdmin } from "../test_utils";
import { testAdminUser, testUser } from "../test_constants";
import { HtmxTargets } from "../../src/components/common/constants";

describe("Users routes file endpoints", async () => {
    const dataSource = await PostgresDataSourceSingleton.getInstance();
    const app = createApplicationServer(dataSource);
    const baseUrl = getTestBaseUrl(app);

    // Create an admin and non admin user
    const loggedInCookie = await loginUser(app, testUser);
    const loggedInCookieAdmin = await loginUserAdmin(
        dataSource,
        app,
        testAdminUser
    );

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

            describe("Admin user", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}/users`, {
                        headers: {
                            Cookie: loggedInCookieAdmin,
                        },
                    })
                );

                test("Returns 200 status code", () => {
                    expect(response.status).toBe(200);
                });

                describe("HTMX markup response", async () => {
                    const $ = cheerio.load(await response.text());
                    const elementsWithHxGet = $("div[hx-get]");

                    test("Returns the main users page", () => {
                        const usersPageIdentifierDiv = $(
                            `#${HtmxTargets.USERS_SECTION}`
                        );
                        expect(usersPageIdentifierDiv.length).toBe(1);
                    });

                    test("GET on /users/list is made on content load only and targets innerHTML", () => {
                        const hxGetValue = $(elementsWithHxGet.first()).attr(
                            "hx-get"
                        );
                        const hxTriggerValue = $(
                            elementsWithHxGet.first()
                        ).attr("hx-trigger");
                        const hxTargetValue = $(elementsWithHxGet.first()).attr(
                            "hx-target"
                        );

                        expect(hxGetValue).toBe("/users/list");
                        expect(hxTriggerValue).toBe("load");
                        expect(hxTargetValue).toBeUndefined();
                    });
                });
            });
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

            describe("Admin user", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}/users/list`, {
                        headers: {
                            Cookie: loggedInCookieAdmin,
                        },
                    })
                );

                test("Returns 200 status code", () => {
                    expect(response.status).toBe(200);
                });

                describe("HTMX markup response", async () => {
                    const $ = cheerio.load(await response.text());
                    const rows = $("tbody tr");

                    test("Rows to contain known users", () => {
                        const usernames: string[] = [];
                        rows.each((_,element) => {
                            const username = $(element).find("td:nth-child(2)").text();
                            usernames.push(username);
                        });
                        expect([testUser.username, testAdminUser.username].sort().join(",") === usernames.sort().join(",")).toBeTrue();
                    });

                    test("Row can get user details via GET with correct hx-target value", () => {
                        /**
                         * By creating admin/non-admin users at beginning of
                         * the test suite, we should have users being retruned.
                         */
                        const firstRow = rows.first();
                        const targetElement = firstRow.find('[hx-get^=/users/]')
                        const hxTargetValue = targetElement.attr("hx-target");
                        expect(firstRow.length).toBe(1);
                        expect(hxTargetValue).toBe(`#${HtmxTargets.USERS_SECTION}`);
                    })
                });
            });
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

            describe("Admin user", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}/users/1`, {
                        headers: {
                            Cookie: loggedInCookieAdmin,
                        },
                    })
                );

                test("Returns 200 status code", () => {
                    expect(response.status).toBe(200);
                });

                describe("HTMX markup response", async () => {
                    const $ = cheerio.load(await response.text());

                    test("Contains navigation to go back to main users page with correct hx-target", () => {
                        const targetElement = $('[hx-get="/users/list"]');
                        const hxTargetValue = targetElement.attr("hx-target");
                        expect(targetElement.length).toBe(1);
                        expect(hxTargetValue).toBe(`#${HtmxTargets.USERS_SECTION}`);
                    });
                });
            });
        });
    });

    describe("POST on /users/toggleActive/:userId endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(new Request(`${baseUrl}/users/toggleActive/1`, {
                method: "POST"
            }));
            
            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", async () => {
            describe("Non-admin user", async () => {
                const response = await app.handle(new Request(`${baseUrl}/users/toggleActive/1`, {
                    method: "POST",
                    headers: {
                        Cookie: loggedInCookie
                    }
                }));

                test("Returns 403 status code", () => {
                    expect(response.status).toBe(403);
                });
            });

            describe("Admin user", async () => {});
        });
    });
});
