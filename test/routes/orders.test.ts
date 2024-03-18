import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";

import { createApplicationServer } from "../../src/server";
import { getTestBaseUrl, loginUser } from "../test_utils";
import { testUser } from "../test_constants";
import { PostgresDataSourceSingleton } from "../../src/postgres";
import { HtmxTargets } from "../../src/components/common/constants";
import { createUnfinisheOrder } from "../fixtures";

describe("Order routes file endpoints", async () => {
    const dataSource = await PostgresDataSourceSingleton.getInstance();
    const app = createApplicationServer(dataSource);
    const baseUrl = getTestBaseUrl(app);

    // Create an admin and non-admin user
    const loggedInCookie = await loginUser(app, testUser);

    // Create some unfinished orders
    await createUnfinisheOrder(app, loggedInCookie);
    await createUnfinisheOrder(app, loggedInCookie);

    describe("GET on /orders endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(new Request(`${baseUrl}/orders`));

            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders`, {
                    headers: {
                        Cookie: loggedInCookie,
                    },
                })
            );

            test("Returns 200 status code", () => {
                expect(response.status).toBe(200);
            });

            describe("HTMX markup response", async () => {
                const $ = cheerio.load(await response.text());
                const elementsWithHxGet = $("div[hx-get]");

                test("Returns the main orders page", () => {
                    const ordersPageIdentifierDiv = $(
                        `#${HtmxTargets.ORDERS_SECTION}`
                    );
                    expect(ordersPageIdentifierDiv.length).toBe(1);
                });

                test("GET on /orders/list is made on content load only", () => {
                    const hxGetValue = $(elementsWithHxGet.first()).attr(
                        "hx-get"
                    );
                    const hxTriggerValue = $(elementsWithHxGet.first()).attr(
                        "hx-trigger"
                    );

                    expect(hxGetValue).toBe("/orders/list");
                    expect(hxTriggerValue).toBe("load");
                });

                test("GET on /orders/list has not hx-target (targets innerHTML of containing div)", () => {
                    const hxTargetValue = $(elementsWithHxGet.first()).attr(
                        "hx-target"
                    );
                    expect(hxTargetValue).toBeUndefined();
                });
            });
        });
    });

    describe("GET on /orders/list endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/list`)
            );

            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/list`, {
                    headers: {
                        Cookie: loggedInCookie,
                    },
                })
            );

            test("Returns 200 status code", () => {
                expect(response.status).toBe(200);
            });

            describe("HTMX markup response", async () => {
                const $ = cheerio.load(await response.text());

                test("Can create a new order via GET /orders/create with correct hx-target", () => {
                    const targetElement = $('[hx-get="/orders/create"]');
                    const hxTargetValue = targetElement.attr("hx-target");

                    expect(targetElement.length).toBe(1);
                    expect(hxTargetValue).toBe(
                        `#${HtmxTargets.ORDERS_SECTION}`
                    );
                });

                test("Calls GET on /orders/todo endpoint on content load only and the target to be its innerHTML", () => {
                    const targetElement = $('[hx-get="/orders/list/all"]');
                    const hxTargetValue = targetElement.attr("hx-target");
                    const hxTriggerValue = targetElement.attr("hx-trigger");

                    expect(targetElement.length).toBe(1);
                    expect(hxTargetValue).toBeUndefined();
                    expect(hxTriggerValue).toBe("load");
                });
            });
        });
    });

    describe("GET on /orders/list/all endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/list/all`)
            );

            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/list/all`, {
                    headers: {
                        Cookie: loggedInCookie,
                    },
                })
            );

            test("Returns 200 status code", () => {
                expect(response.status).toBe(200);
            });

            describe("HTMX markup response", async () => {
                const responseText = await response.text();
                console.log("responseText", responseText);
            });
        });
    });

    describe("GET on /orders/create endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/create`)
            );

            expect(response.status).toBe(401);
        });

        describe("User session active", () => {});
    });

    // TODO: Good idea to find a more descriptive url for this endpoint
    // maybe somethinf like /orders/activeItems/:orderId
    describe("GET on /orders/active/:orderId endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/active/1`)
            );

            expect(response.status).toBe(401);
        });

        describe("User session active", () => {});
    });

    describe("GET on /orders/resume/:orderId enpoints", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/resume/1`)
            );

            expect(response.status).toBe(401);
        });

        describe("User session active", () => {});
    });

    describe("POST on /orders/confirm/:orderId/:paymentId endpoint", () => {
        describe("User session inactive", () => {});

        describe("User session active", () => {});
    });

    describe("POST on /orders/item/updateQuanity/:itemId/:updateType endpoint", () => {
        describe("User session inactive", () => {});

        describe("User session active", () => {});
    });

    // TODO: Another candidate for changing the url. Chane to toggleActive
    describe("POST on /orders/item/change/:orderId/:inventoryId endpoint", () => {
        describe("User session inactive", () => {});

        describe("User session active", () => {});
    });

    // TODO: Change this as well from updateType to paymentType
    describe("POST on /orders/payment/updateType/:paymentId", () => {
        describe("User session inactive", () => {});

        describe("User session active", () => {});
    });
});
