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

          test("GET on /inventory/list is made on content load only", () => {
            const hxGetValue = $(elementsWithHxGet.first()).attr("hx-get");
            const hxTriggerValue = $(elementsWithHxGet.first()).attr(
              "hx-trigger",
            );

            expect(hxGetValue).toBe("/inventory/list");
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
      describe("Admin user", async () => {
        const response = await app.handle(
          new Request(`${baseUrl}/inventory/list`, {
            method: "GET",
            headers: {
              Cookie: loggedInCookieAdmin
            }
          }),
        );

        test("Returns 200 status code", () => {
          expect(response.status).toBe(200);
        });

        describe("HTMX markup response", async() => {
          const $ = cheerio.load(await response.text());
         
          test("Contains div to inject inventory list items markup", () => {
            const targetElement = $(`#${HtmxTargets.INVENTORY_DATA_LIST}`);
            expect(targetElement.length).toBe(1);
          });

          test("Can search for inventory items via GET /inventory/list/search with correct hx-target", () => {
            const targetElement = $('[hx-get="/inventory/list/search"]');
            const hxTargetValue = targetElement.attr("hx-target");
            expect(targetElement.length).toBe(1);
            expect(hxTargetValue).toBe(`#${HtmxTargets.INVENTORY_DATA_LIST}`);
          });

          test("GET /inventory/list/search has a user input delay before calling API", () => {
            const targetElement = $('[hx-get="/inventory/list/search"]');
            const hxTriggerValue = targetElement.attr("hx-trigger");
            /**
             * Ensure the hx-trigger checks for:
             * keyup event: After the user has completed typing
             * changed event: Ensure the text value of the input has changed before making a request
             * delay: Has some delay before making the request
             *
            */
            expect(hxTriggerValue).toContain("keyup");
            expect(hxTriggerValue).toContain("changed");
            expect(hxTriggerValue).toContain("delay");
          });

          test("Can create a new inventory item via GET /inventory/create with correct hx-target", () => {
            const targetElement = $('[hx-get="/inventory/create"]');
            const hxTargetValue = targetElement.attr("hx-target");
            expect(targetElement.length).toBe(1);
            expect(hxTargetValue).toBe(`#${HtmxTargets.INVENTORY_SECTION}`);
          });

          test("Calls GET on /inventory/list/all endpoint on content load only and the target to be its innerHTML", () => {
            const targetElement = $('[hx-get="/inventory/list/all"]');
            const hxTargetValue = targetElement.attr("hx-target")
            const hxTriggerValue = targetElement.attr("hx-trigger");
            expect(targetElement.length).toBe(1);
            expect(hxTargetValue).toBeUndefined();
            expect(hxTriggerValue).toBe("load");
          });
        });
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
        new Request(`${baseUrl}/inventory/list/search?search="searchTerm"`),
      );

      test("Returns a 401 status code", () => {
        expect(response.status).toBe(401);
      });
    });

    describe("User session active", () => {
      describe("Non-admin user", async () => {
        const response = await app.handle(
          new Request(`${baseUrl}/inventory/list/search?search="searchTerm`, {
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
