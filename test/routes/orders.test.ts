import { describe, expect, test } from "bun:test";

import { createApplicationServer } from "../../src/server";
import { getTestBaseUrl, loginUser, loginUserAdmin } from "../test_utils";
import { testUser } from "../test_constants";
import { PostgresDataSourceSingleton } from "../../src/postgres";

describe("Order roiutes file endpoints", async () => {
    const dataSource = await PostgresDataSourceSingleton.getInstance();
    const app = createApplicationServer(dataSource);
    const baseUrl = getTestBaseUrl(app);

    // Create an admin and non-admin user
    const loggedInCookie = await loginUser(app, testUser);

    describe("GET on /orders endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(new Request(`${baseUrl}/orders`));

            test("Returns 401 status code", () => {
                expect(response.status).toBe(401);
            });
        });

        describe("User session active", () => {});
    });

    describe("GET on /orders/list endpoint", () => {
        describe("User session inactive", () => {});

        describe("User session active", () => {});
    });

    describe("GET on /orders/list/all endpoint", () => {
        describe("User session inactive", () => {});

        describe("User session active", () => {});
    });

    describe("GET on /orders/create endpoint", () => {
        describe("User session inactive", () => {});

        describe("User session active", () => {});
    });

    // TODO: Good idea to find a more descriptive url for this endpoint
    // maybe somethinf like /orders/activeItems/:orderId
    describe("GET on /orders/active/:orderId endpoint", () => {
        describe("User session inactive", () => {});

        describe("User session active", () => {});
    });

    describe("GET on /orders/resume/:orderId enpoints", () => {
        describe("User session inactive", () => {});

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
