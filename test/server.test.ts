import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";
import "reflect-metadata"; // required for TypeORM

import { createApplicationServer } from "../src/server.ts";
import { PostgresDataSourceSingleton } from "../src/postgres/index.ts";
import { ServerHxTriggerEvents } from "../src/services/common/constants.ts";
import { HtmxTargets } from "../src/components/common/constants.ts";
import { loginTestUser } from "./test_utils.ts";

describe("Root server", async () => {
  const dataSource = await PostgresDataSourceSingleton.getInstance();
  const app = createApplicationServer(dataSource);
  const loggedInCookie = await loginTestUser(app);

  describe("GET on / endpoint", async () => {
    const response = await app.handle(new Request("http://localhost:3000"));

    test("Returns 200 response", () => {
      expect(response.status).toBe(200);
    });

    test("Returns a text/html content-type", () => {
      expect(response.headers.get("content-type")).toInclude("text/html");
    });

    describe("GET on / HTMX markup response", async () => {
      const $ = cheerio.load(await response.text());
      const elementsWithHxGet = $("div[hx-get]");

      test("Calls GET on /root endpoint", () => {
        const hxGetValue = $(elementsWithHxGet.first()).attr("hx-get");
        expect(hxGetValue).toBe("/root");
      });

      test("GET request on /root endpoint is made on content load & login status change HTMX event", () => {
        const hxTriggerValue = $(elementsWithHxGet.first()).attr("hx-trigger");
        expect(hxTriggerValue).toInclude("load");
        expect(hxTriggerValue).toInclude(
          ServerHxTriggerEvents.LOGIN_STATUS_CHANGE,
        );
      });

      test("GET request on /root endpoint targets the root-div", () => {
        const hxTargetValue = $(elementsWithHxGet.first()).attr("hx-target");
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
    describe("When logged out", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/root"),
      );

      test("Returns a 200 response", () => {
        expect(response.status).toBe(200);
      });

      describe("GET on /root HTMX markup response", async () => {
        test("Returns the login markup", async () => {
          expect(await response.text()).toInclude("Log in to get started");
        });
      });
    });

    describe("When logged in", async () => {
      const response = await app.handle(
        new Request("http://localhost:3000/root", {
          method: "GET",
          headers: {
            Cookie: loggedInCookie,
          },
        }),
      );

      test("Returns a 200 response", () => {
        expect(response.status).toBe(200);
      });

      describe("GET on /root HTMX markup response", async () => {
        test("Returns the main application markup", async () => {
          const $ = cheerio.load(await response.text());
          const mainSectionDiv = $(`#${HtmxTargets.MAIN_SECTION}`);
          expect(mainSectionDiv.length).toBe(1);
        });
      });
    });
  });
});
