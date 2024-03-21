import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";

import { createApplicationServer } from "../../src/server";
import {
    getHxPostValueInput,
    getTestBaseUrl,
    loginUser,
    loginUserAdmin,
} from "../test_utils";
import { testUser, testAdminUser } from "../test_constants";
import { PostgresDataSourceSingleton } from "../../src/postgres";
import { HtmxTargets } from "../../src/components/common/constants";
import {
    createInventoryItems,
    createUnfinisheOrder,
    generateInventoryItems,
} from "../fixtures";
import { ServerHxTriggerEvents } from "../../src/services/common/constants";
import { Cookie } from "elysia";

describe("Order routes file endpoints", async () => {
    const dataSource = await PostgresDataSourceSingleton.getInstance();
    const app = createApplicationServer(dataSource);
    const baseUrl = getTestBaseUrl(app);

    // Create an admin and non-admin user
    const loggedInCookie = await loginUser(app, testUser);
    const loggedInCookieAdmin = await loginUserAdmin(
        dataSource,
        app,
        testAdminUser
    );

    // Add some inventory items
    const inventoryItems = generateInventoryItems(5);
    await createInventoryItems(app, inventoryItems, loggedInCookieAdmin);

    // Create some unfinished orders
    const createOrderResponse = await createUnfinisheOrder(app, loggedInCookie);

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

            test("Returns markup showing no active orders for a blank slate", async () => {
                expect(await response.text()).toContain(
                    "No recent unfinished orders."
                );
            });

            // Add at least one item to order to populate orders list
            const $ = cheerio.load(createOrderResponse);
            const firstInventoryItem = $("details ul li:nth-of-type(1)");
            const hxPostValue = getHxPostValueInput(
                firstInventoryItem.text(),
                "hx-post"
            );
            const addInventoryItemResponse = await app.handle(
                new Request(`${baseUrl}${hxPostValue}`, {
                    method: "POST",
                    headers: {
                        Cookie: loggedInCookie,
                    },
                })
            );
            expect(addInventoryItemResponse.status).toBe(200);

            describe("HTMX markup response", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}/orders/list/all`, {
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );
                const $ = cheerio.load(await response.text());
                const rows = $("tbody tr");
                const firstRow = rows.first();

                test("Shows unfinshed orders", async () => {
                    expect(firstRow.length).toBe(1);
                });

                test("Row can resume order via GET with correct hx-target value", () => {
                    const targetElement = firstRow.find(
                        '[hx-get^="/orders/resume"]'
                    );
                    const hxTargetValue = targetElement.attr("hx-target");

                    expect(targetElement.length).toBe(1);
                    expect(hxTargetValue).toBe(
                        `#${HtmxTargets.ORDERS_SECTION}`
                    );
                });
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

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/create`, {
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
                const $ = cheerio.load(responseText);

                test("Contains navigation to go back to main orders page with correct hx-target", () => {
                    const targetElement = $('[hx-get="/orders/list"]');
                    const hxTargetValue = targetElement.attr("hx-target");

                    expect(targetElement.length).toBe(1);
                    expect(hxTargetValue).toBe(
                        `#${HtmxTargets.ORDERS_SECTION}`
                    );
                });

                test("Contains a listing of inventory items", () => {
                    /**
                     * Avoiding giving partiular details of the inventory items
                     * because other tests (especially in the inventory routes
                     * suite) might create unrelated inventory items, which is
                     * a recipe for race conditions and thus flaky tests.
                     */
                    const inventoryItems = $("details ul li");
                    expect(inventoryItems.length).toBeGreaterThanOrEqual(1);
                });

                test("Inventory Item rows can be activated/deactivated with POST to /orders/item/change/:orderId endpoint on change to checkbox state", () => {
                    const firstInventoryItem = $(
                        "details ul li:nth-of-type(1)"
                    );

                    expect(
                        getHxPostValueInput(
                            firstInventoryItem.text(),
                            "hx-post"
                        )
                    ).toInclude("/orders/item/change");
                    expect(
                        getHxPostValueInput(
                            firstInventoryItem.text(),
                            "hx-trigger"
                        )
                    ).toBe("change");
                });

                test("Fetches current order details via GET /orders/active/:orderId on load and on server Hx-Trigger response header", () => {
                    const targetElement = $('[hx-get^="/orders/active/"]');
                    const hxTriggerValue = targetElement.attr("hx-trigger");

                    expect(targetElement.length).toBe(1);
                    expect(hxTriggerValue).toInclude("load");
                    expect(hxTriggerValue).toInclude(
                        `${ServerHxTriggerEvents.REFRESH_ORDER}`
                    );
                    expect(hxTriggerValue).toInclude("from:body");
                });
            });
        });
    });

    // TODO: Good idea to find a more descriptive url for this endpoint
    // maybe something like /orders/live/:orderId
    //
    // For speed, this test will rely on the previously created order
    // i.e {baseUrl}/orders/active/1
    //
    // But this should be changed as soon as possible, the test should
    // create and fetch its own order. This hard coding will eventaully
    // lead to flaky tests.
    describe("GET on /orders/active/:orderId endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/active/1`)
            );

            expect(response.status).toBe(401);
        });

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/active/1`, {
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
                const $ = cheerio.load(responseText);

                test("Can increment quantiy of an item", () => {});

                test("Can decrement quantity of an item", () => {});

                test("Correctly sums up total cost of items", () => {});

                test("Can change payment type via POST to /orders/payment/updateType/ with cash and mpesa as options", () => {
                    const fieldSet = $("fieldset");
                    const radioButtons = $(fieldSet).find(
                        'input[type="radio"]'
                    );
                    const radioValues: Array<string | undefined> = [];
                    radioButtons.each((_, element) => {
                        const hxPostValue = $(element).attr("hx-post");
                        expect(hxPostValue).toStartWith(
                            "/orders/payment/updateType"
                        );
                        radioValues.push($(element).attr("value"));
                    });
                    expect(radioValues.length).toBe(2);
                    expect(radioValues.join(",")).toInclude("cash");
                    expect(radioValues.join(",")).toInclude("mpesa");
                });

                test("Can submit order via POST to /orders/confirm/:orderId/:paymentId with correct hx-target and progress indicator", () => {
                    const targetElement = $(
                        'button[hx-post^="/orders/confirm"]'
                    );
                    const hxTargetValue = targetElement.attr("hx-target");
                    const hxIndicatorValue = targetElement.attr("hx-indicator");

                    expect(targetElement.length).toBe(1);
                    expect(hxTargetValue).toBe(
                        `#${HtmxTargets.CREATE_ORDER_SECTION}`
                    );
                    expect(hxIndicatorValue).toBe(
                        "#confirm-progress-indicator"
                    );
                });

                test("has progress indicator for POST to /orders/confirm/:orderId/:paymentId", () => {
                    const targetElement = $("#confirm-progress-indicator");
                    expect(targetElement.length).toBe(1);
                });
            });
        });
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
