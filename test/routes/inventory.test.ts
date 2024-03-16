import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";

import { PostgresDataSourceSingleton } from "../../src/postgres";
import { createApplicationServer } from "../../src/server";
import { getTestBaseUrl, loginUser, loginUserAdmin } from "../test_utils";
import { HtmxTargets } from "../../src/components/common/constants";
import { testAdminUser, testUser } from "../test_constants";

describe("Inventory routes file endpoints", async () => {
  const dataSource = await PostgresDataSourceSingleton.getInstance();
  const app = createApplicationServer(dataSource);
  const baseUrl = getTestBaseUrl(app);
  const loggedInCookie = await loginUser(app, testUser);
  const loggedInCookieAdmin = await loginUserAdmin(dataSource, app, testAdminUser);

  describe("GET on /inventory endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(new Request(`${baseUrl}/inventory`));

      test("Returns 401 status code", async () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", async () => {
      describe("Non-admin user", async () => {
        const response = await app.handle(
          new Request(`${baseUrl}/inventory`, {
            method: "GET",
            headers: {
              Cookie: loggedInCookie,
            },
          }),
        );

        test("Returns 403 status code", () => {
          expect(response.status).toBe(403);
        });
      });

      describe("Admin user", async () => {
        const response = await app.handle(
          new Request(`${baseUrl}/inventory`, {
            method: "GET",
            headers: {
              Cookie: loggedInCookieAdmin,
            },
          }),
        );

        test("Returns 200 status code", () => {
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
  });

  describe("GET on /inventory/list endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(
          new Request(`${baseUrl}/inventory/list`),
      );
      
      test("Returns 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", async () => {
        const response = await app.handle(
          new Request(`${baseUrl}/inventory/list`, {
            method: "GET",
            headers: {
              Cookie: loggedInCookie
            }
          }),
        );  

        test("Returns 403 status code", () => {
          expect(response.status).toBe(403);
        });
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

      test("Returns 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", async () => {
        const response = await app.handle(
          new Request(`${baseUrl}/inventory/list/all`, {
            method: "GET",
            headers: {
              Cookie: loggedInCookie
            }
          }),
        );

        test("Returns 403 status code", () => {
          expect(response.status).toBe(403);
        });
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
      describe("Non-admin user", async () => {
        const response = await app.handle(
          new Request(`${baseUrl}/inventory/list/search`, {
            method: "GET",
            headers: {
              Cookie: loggedInCookie
            }
          }),
        );

        test("Returns 403 status code", () => {
          expect(response.status).toBe(403);
        });
      });
      describe("Admin user", () => {

      });
    });
  });

  describe("GET on /inventory/create endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(new Request(`${baseUrl}/inventory/create`));

      test("Returns 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", async () => {
        const response = await app.handle(new Request(`${baseUrl}/inventory/create`, {
          method: "GET",
          headers: {
            Cookie: loggedInCookie
          } 
        }));

        test("Returns 403 status code", () => {
          expect(response.status).toBe(403);
        });
      });
      describe("Admin user", () => {

      });
    });
  });

  describe("GET on /inventory/edit/:inventoryId endpoint", () => {
    describe("User session inactive", async () => {
      const response = await app.handle(new Request(`${baseUrl}/inventory/edit/1`));

      test("Returns 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", async () => {
        const response = await app.handle(new Request(`${baseUrl}/inventory/edit/1`, {
          method: "GET",
          headers: {
            Cookie: loggedInCookie
          }
        }));

        test("Returns 403 status code", () => {
          expect(response.status).toBe(403);
        });
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
