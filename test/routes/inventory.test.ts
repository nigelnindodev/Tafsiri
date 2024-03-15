import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";
import { PostgresDataSourceSingleton } from "../../src/postgres";
import { createApplicationServer } from "../../src/server";
import { getTestBaseUrl, loginTestUser } from "../test_utils";
import { HtmxTargets } from "../../src/components/common/constants";

describe("Inventory routes file endpoints", async () => {
  const dataSource = await PostgresDataSourceSingleton.getInstance();
  const app = createApplicationServer(dataSource);
  const baseUrl = getTestBaseUrl(app);
  const loggedInCookie = await loginTestUser(app);

  describe("GET on /inventory endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(new Request(`${baseUrl}/inventory`));

      test("Returns a 401 status code", async () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", async () => {
      const response = await app.handle(
        new Request(`${baseUrl}/inventory`, {
          method: "GET",
          headers: {
            Cookie: loggedInCookie,
          },
        }),
      );

      test("Returns a 200 status code", () => {
        expect(response.status).toBe(200);
      });

      describe("HTMX markup response", async () => {
        const $ = cheerio.load(await response.text());
        const elementsWithHxGet = $("div[hx-get]");

        test("Returns the main inventory page", async () => {
          const inventoryPageIdentifierDiv = $(
            `#${HtmxTargets.INVENTORY_SECTION}`,
          );
          expect(inventoryPageIdentifierDiv.length).toBe(1);
        });

        test("Calls GET on /inventory/list endpoint", () => {
          const hxGetValue = $(elementsWithHxGet.first()).attr("hx-get");
          expect(hxGetValue).toBe("/inventory/list");
        });

        test("GET on /inventory/list is made on content load only", () => {
          const hxTriggerValue = $(elementsWithHxGet.first()).attr(
            "hx-trigger",
          );
          expect(hxTriggerValue).toBe("load");
        });

        test("GET on /inventory/list has no hx-target (targets innerHTML of containing div)", () => {
          const hxTargetValue = $(elementsWithHxGet.first()).attr("hx-target");
          expect(hxTargetValue).toBeUndefined();
        });
      });
    });
  });

  describe("GET on /inventory/list endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(
        new Request(`${baseUrl}/inventory/list`),
      );

      test("Returns a 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", () => {

      });
      describe("Admin user", () => {

      });
    });
  });

  describe("GET on /inventory/list/all endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(
        new Request(`${baseUrl}/inventory/list/all`),
      );

      test("Returns a 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", () => {

      });
      describe("Admin user", () => {

      });
    });
  });

  describe("GET on /inventory/list/search endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(
        new Request(`${baseUrl}/inventory/list/search`),
      );

      test("Returns a 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", () => {

      });
      describe("Admin user", () => {

      });
    });
  });

  describe("GET on /inventory/create endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(new Request(`${baseUrl}/inventory/create`));

      test("Returns a 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", () => {

      });
      describe("Admin user", () => {

      });
    });
  });

  describe("GET on /inventory/edit/:inventoryId endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(new Request(`${baseUrl}/inventory/edit/1`));

      test("Returns a 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", () => {

      });
      describe("Admin user", () => {

      });
    });
  });

  describe("POST on /inventory/create endpoint", () => {
    describe("User session inactive", () => {});

    describe("User session active", () => {
      describe("Non-admin user", () => {

      });
      describe("Admin user", () => {

      });
    });
  });

  describe("POST on /inventory/edit/:inventoryId endpoint", () => {
    describe("User session inactive", () => {});

    describe("User session active", () => {
      describe("Non-admin user", () => {

      });
      describe("Admin user", () => {

      });
    });
  });
});
