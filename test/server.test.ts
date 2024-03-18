import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";

import { createApplicationServer } from "../src/server.ts";
import { PostgresDataSourceSingleton } from "../src/postgres/index.ts";
import { ServerHxTriggerEvents } from "../src/services/common/constants.ts";
import { HtmxTargets } from "../src/components/common/constants.ts";
import { getTestBaseUrl, loginUser } from "./test_utils.ts";
import { testUser } from "./test_constants.ts";

describe("Main routes file endpoints", async () => {
    const dataSource = await PostgresDataSourceSingleton.getInstance();
    const app = createApplicationServer(dataSource);
    const baseUrl = getTestBaseUrl(app);
    const loggedInCookie = await loginUser(app, testUser);

    describe("GET on / endpoint", async () => {
        const response = await app.handle(new Request(baseUrl));

        test("Returns 200 status code", () => {
            expect(response.status).toBe(200);
        });

        test("Returns a text/html content-type", () => {
            expect(response.headers.get("content-type")).toInclude("text/html");
        });

        describe("HTMX markup response", async () => {
            const $ = cheerio.load(await response.text());
            const elementsWithHxGet = $("div[hx-get]");

            test("Calls GET on /root endpoint", () => {
                const hxGetValue = $(elementsWithHxGet.first()).attr("hx-get");
                expect(hxGetValue).toBe("/root");
            });

            test("GET on /root endpoint is made on content load & login status change HTMX event", () => {
                const hxTriggerValue = $(elementsWithHxGet.first()).attr(
                    "hx-trigger"
                );
                expect(hxTriggerValue).toInclude("load");
                expect(hxTriggerValue).toInclude(
                    ServerHxTriggerEvents.LOGIN_STATUS_CHANGE
                );
            });

            test("GET request on /root endpoint has correct hx-target", () => {
                const hxTargetValue = $(elementsWithHxGet.first()).attr(
                    "hx-target"
                );
                expect(hxTargetValue).toInclude(HtmxTargets.ROOT_DIV);
            });
        });
    });

    /**
     * No need to add HTMX validations for the endpoints called here. This
     * will be comprehensively covered in the specific endpoint tests.
     *
     * Simply ensure correct view are called for logged in and out states.
     */
    describe("GET on /root endpoint", () => {
        describe("User session inactive", async () => {
            const response = await app.handle(new Request(`${baseUrl}/root`));

            test("Returns a 200 status code", () => {
                expect(response.status).toBe(200);
            });

            describe("HTMX markup response", () => {
                test("Returns the login markup", async () => {
                    const responseText = await response.text();
                    expect(responseText).toInclude("Log in to get started");
                });
            });
        });

        describe("User session active", async () => {
            const response = await app.handle(
                new Request(`${baseUrl}/root`, {
                    headers: {
                        Cookie: loggedInCookie,
                    },
                })
            );

            test("Returns a 200 status code", () => {
                expect(response.status).toBe(200);
            });

            describe("HTMX markup response", () => {
                test("Returns the main application markup", async () => {
                    const $ = cheerio.load(await response.text());
                    const mainSectionDiv = $(`#${HtmxTargets.MAIN_SECTION}`);
                    expect(mainSectionDiv.length).toBe(1);
                });
            });
        });
    });
});
