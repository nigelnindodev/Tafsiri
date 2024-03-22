import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";

import { createApplicationServer } from "../../src/server";
import { getTestBaseUrl, loginUser, loginUserAdmin } from "../test_utils";
import { testUser, testAdminUser } from "../test_constants";
import { PostgresDataSourceSingleton } from "../../src/postgres";
import { HtmxTargets } from "../../src/components/common/constants";
import {
    createInventoryItems,
    createUnfinisheOrder,
    generateInventoryItems,
} from "../fixtures";
import { ServerHxTriggerEvents } from "../../src/services/common/constants";
import { PaymentTypes } from "../../src/postgres/common/constants";

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
            const hxPostValue = $("details ul li:nth-of-type(1)")
                .find("label input")
                .attr("hx-post");
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
                    const firstInventoryItemInput = $(
                        "details ul li:nth-of-type(1)"
                    ).find("label input");

                    const hxPostValue = firstInventoryItemInput.attr("hx-post");
                    const hxTriggerValue =
                        firstInventoryItemInput.attr("hx-trigger");

                    expect(hxPostValue).toInclude("/orders/item/change");
                    expect(hxTriggerValue).toBe("change");
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
                const $ = cheerio.load(await response.text());

                test("Can increment quantiy of an item", () => {
                    const targetElement = $('button[hx-post*="/INC"]');
                    expect(targetElement.length).toBe(1);
                });

                test("Can decrement quantity of an item", () => {
                    const targetElement = $('button[hx-post*="/DEC"]');
                    expect(targetElement.length).toBe(1);
                });

                test("Correctly sums up total cost of items", () => {
                    const items: { name: string; price: number }[] = [];

                    $("details > blockquote > div.grid").each(
                        function (_, element) {
                            const itemName = $(element)
                                .find("h4")
                                .text()
                                .trim();

                            const itemPrice = parseFloat(
                                $(element)
                                    .find("mark")
                                    .text()
                                    .replace("KES", "")
                            );

                            // query markup above also fetches the final total cost
                            // so we need to ensure its not added to the items array
                            // the total cost will not have an item name
                            if (itemName !== "") {
                                items.push({
                                    name: itemName,
                                    price: itemPrice,
                                });
                            }
                        }
                    );

                    const totalCost = $("div.grid h3.text-green-500")
                        .parent()
                        .next()
                        .text()
                        .trim();
                    const totalCostNum = parseFloat(
                        totalCost.replace("KES", "")
                    );
                    let totalCostFromItems = 0;

                    items.forEach((item) => (totalCostFromItems += item.price));

                    expect(totalCostFromItems).toBe(totalCostNum);
                });

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

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/resume/1`, {
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
                    const firstInventoryItemInput = $(
                        "details ul li:nth-of-type(1)"
                    ).find("label input");

                    const hxPostValue = firstInventoryItemInput.attr("hx-post");
                    const hxTriggerValue =
                        firstInventoryItemInput.attr("hx-trigger");

                    expect(hxPostValue).toInclude("/orders/item/change");
                    expect(hxTriggerValue).toBe("change");
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

    describe("POST on /orders/item/updateQuanity/:itemId/:updateType endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/item/updateQuantity/1/INC`, {
                    method: "POST",
                })
            );

            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", async () => {
            const getLiveOrderResponseText = await app
                .handle(
                    new Request(`${baseUrl}/orders/active/1`, {
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                )
                .then((result) => result.text());

            const $ = cheerio.load(getLiveOrderResponseText);
            const incrementItemUrl = $('button[hx-post*="/INC"]').attr(
                "hx-post"
            );
            const decrementItemUrl = $('button[hx-post*="/DEC"]').attr(
                "hx-post"
            );

            describe("Increment", async () => {
                console.log("incrementItemUrl", incrementItemUrl);
                const response = await app.handle(
                    new Request(`${baseUrl}${incrementItemUrl}`, {
                        method: "POST",
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );

                const responseText = await app
                    .handle(
                        new Request(`${baseUrl}/orders/active/1`, {
                            headers: {
                                Cookie: loggedInCookie,
                            },
                        })
                    )
                    .then((result) => result.text());

                test("Returns 200 status code and correct HTMX server trigger event", () => {
                    expect(response.status).toBe(200);
                    expect(response.headers.get("hx-trigger")).toBe(
                        ServerHxTriggerEvents.REFRESH_ORDER
                    );
                });

                test("Increses quantity of selected item", async () => {
                    const $ = cheerio.load(responseText);
                    const targetText = $("div.center h5").text();
                    expect(targetText).toBe("2 item(s)");
                });
            });

            describe("Decrement", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}${decrementItemUrl}`, {
                        method: "POST",
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );

                const responseText = await app
                    .handle(
                        new Request(`${baseUrl}/orders/active/1`, {
                            headers: {
                                Cookie: loggedInCookie,
                            },
                        })
                    )
                    .then((result) => result.text());

                test("Returns 200 status code and correct HTMX server trigger event", () => {
                    expect(response.status).toBe(200);
                    expect(response.headers.get("hx-trigger")).toBe(
                        ServerHxTriggerEvents.REFRESH_ORDER
                    );
                });

                test("Decreases quantity of the selected item", () => {
                    const $ = cheerio.load(responseText);
                    const targetText = $("div.center h5").text();
                    expect(targetText).toBe("1 item(s)");
                });
            });
        });
    });

    // TODO: Another candidate for changing the url. Change to toggleActive
    describe("POST on /orders/item/change/:orderId/:inventoryId endpoint", async () => {
        describe("User session inactive", async () => {
            const responseStatus = await app
                .handle(
                    new Request(`${baseUrl}/orders/item/change/1/1`, {
                        method: "POST",
                    })
                )
                .then((result) => result.status);

            test("Returns 401 status code", () => {
                expect(responseStatus).toBe(401);
            });
        });

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/item/change/1/1`, {
                    method: "POST",
                    headers: {
                        Cookie: loggedInCookie,
                    },
                })
            );

            const targetResponseText = await app
                .handle(
                    new Request(`${baseUrl}/orders/active/1`, {
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                )
                .then((result) => result.text());

            test("Returns 200 status code and correct HTMX server trigger event", () => {
                expect(response.status).toBe(200);
                expect(response.headers.get("hx-trigger")).toBe(
                    ServerHxTriggerEvents.REFRESH_ORDER
                );
            });

            test("Adds an item from the inventory to the order", async () => {
                const $ = cheerio.load(targetResponseText);

                expect($('button[hx-post*="/INC"]').length).toBe(2);
                expect($('button[hx-post*="/DEC"]').length).toBe(2);
            });

            test("On calling endpoint again, removes the added item from the order", async () => {
                await app.handle(
                    new Request(`${baseUrl}/orders/item/change/1/1`, {
                        method: "POST",
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );

                const response = await app.handle(
                    new Request(`${baseUrl}/orders/active/1`, {
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );

                const $ = cheerio.load(await response.text());

                expect($('button[hx-post*="/INC"]').length).toBe(1);
                expect($('button[hx-post*="/DEC"]').length).toBe(1);
            });
        });
    });

    // TODO: Change this as well from updateType to paymentType
    describe("POST on /orders/payment/updateType/:paymentId", () => {
        describe("User session inactive", async () => {
            const responseStatus = await app
                .handle(
                    new Request(`${baseUrl}/orders/payment/updateType/1`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            paymentType: PaymentTypes.CASH,
                        }),
                    })
                )
                .then((result) => result.status);

            test("Returns 401 response", () => {
                expect(responseStatus).toBe(401);
            });
        });

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/payment/updateType/1`, {
                    method: "POST",
                    headers: {
                        Cookie: loggedInCookie,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ paymentType: PaymentTypes.MPESA }),
                })
            );

            test("Returns 200 status code and correct HTMX server trigger event", async () => {
                expect(response.status).toBe(200);
                expect(response.headers.get("hx-trigger")).toBe(
                    ServerHxTriggerEvents.REFRESH_ORDER
                );
            });

            test("Changes active payment type for order", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}/orders/active/1`, {
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );

                const $ = cheerio.load(await response.text());
                const isChecked = $("#mpesa").prop("checked");

                expect(isChecked).toBe(true);
            });
        });
    });

    describe("POST on /orders/confirm/:orderId/:paymentId endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/confirm/1/1`, {
                    method: "POST",
                })
            );

            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/orders/confirm/1/1`, {
                    method: "POST",
                    headers: {
                        Cookie: loggedInCookie,
                    },
                })
            );

            // TODO: Should be 201 status code
            test("Returns 200 status code", () => {
                expect(response.status).toBe(200);
            });

            test("After confirmaing order, should be removed from unfinished orders", async () => {
                const response = await app.handle(
                    new Request(`${baseUrl}/orders/list/all`, {
                        headers: {
                            Cookie: loggedInCookie,
                        },
                    })
                );

                expect(await response.text()).toContain(
                    "No recent unfinished orders."
                );
            });
        });
    });
});
