import "reflect-metadata"; // required for TypeORM
import * as cheerio from "cheerio";

import { describe, expect, test } from "bun:test";

import { createApplicationServer } from "../src/server.ts";
import { PostgresDataSourceSingleton } from "../src/postgres/index.ts";
import { ServerHxTriggerEvents } from "../src/services/common/constants.ts";
import { HtmxTargets } from "../src/components/common/constants.ts";

describe("Root server", async () => {
  describe("Root / endpoint GET API call", async () => {
    const dataSource = await PostgresDataSourceSingleton.getInstance();
    const app = createApplicationServer(dataSource);
    const response = await app.handle(new Request("http://localhost:3000"));

    test("Returns a 200 response", () => {
      expect(response.status).toBe(200);
    });

    test("Should return a text/html content-type", () => {
      expect(response.headers.get("content-type")).toInclude("text/html");
    });

    test("Response htmx should include markup that loads the root component when the content is loaded", async () => {
      const $ = cheerio.load(await response.text());
      const elementsWithHxGet = $("div[hx-get]");

      elementsWithHxGet.each((index, element) => {
        if (index === 0) {
          const hxGetValue = $(element).attr("hx-get");
          expect(hxGetValue).toBe("/root");

          const hxTriggerValue = $(element).attr("hx-trigger");
          expect(hxTriggerValue).toInclude("load");
          expect(hxTriggerValue).toInclude(ServerHxTriggerEvents.LOGIN_STATUS_CHANGE);

          const hxTargetValue = $(element).attr("hx-target");
          expect(hxTargetValue).toInclude(HtmxTargets.ROOT_DIV);
        }
      });
    });
  });
});
