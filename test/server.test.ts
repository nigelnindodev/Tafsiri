import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";
import "reflect-metadata"; // required for TypeORM

import { createApplicationServer } from "../src/server.ts";
import { PostgresDataSourceSingleton } from "../src/postgres/index.ts";
import { ServerHxTriggerEvents } from "../src/services/common/constants.ts";
import { HtmxTargets } from "../src/components/common/constants.ts";

describe("Root server", async () => {
  const dataSource = await PostgresDataSourceSingleton.getInstance();
  const app = createApplicationServer(dataSource);

  describe("GET on / endpoint", async () => {
    const response = await app.handle(new Request("http://localhost:3000"));

    test("Returns 200 response", () => {
      expect(response.status).toBe(200);
    });

    test("Returns a text/html content-type", () => {
      expect(response.headers.get("content-type")).toInclude("text/html");
    });

    describe("GET on / response HTMX markup", async () => {
      const $ = cheerio.load(await response.text());
      const elementsWithHxGet = $("div[hx-get]");

      test("Calls GET on /root endpoint", () => {
        const hxGetValue = $(elementsWithHxGet.first()).attr("hx-get");
        expect(hxGetValue).toBe("/root");
      });

      test("GET request on /root endpoint is made on content load & login status change HTMX event", () => {
        const hxTriggerValue = $(elementsWithHxGet.first()).attr("hx-trigger");
        expect(hxTriggerValue).toInclude("load");
        expect(hxTriggerValue).toInclude(ServerHxTriggerEvents.LOGIN_STATUS_CHANGE);
      });

      test("GET request on /root endpoint targets the root-div", () => {
        const hxTargetValue = $(elementsWithHxGet.first()).attr("hx-target");
        expect(hxTargetValue).toInclude(HtmxTargets.ROOT_DIV);
      });
    });
  });
});
