import { describe, expect, test } from "bun:test";
import * as cheerio from "cheerio";
import { PostgresDataSourceSingleton } from "../../src/postgres";
import { createApplicationServer } from "../../src/server";
import { getTestBaseUrl, loginTestUser } from "../test_utils";

describe("Inventory routes file endpoints", async () => {
  const dataSource = await PostgresDataSourceSingleton.getInstance();
  const app = createApplicationServer(dataSource);
  const baseUrl = getTestBaseUrl(app);
  const loggedInCookie = await loginTestUser(app);

  describe("GET on /inventory endpoint", () => {
    describe("When user session inactive", async () => {
      const response = await app.handle(new Request(`${baseUrl}/inventory`));

      test("Returns a 401 status code", async () => {
        expect(response.status).toBe(401);
      });
    });

    describe("When user session active", async () => {
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

      describe("HTMX markup response", () => {});
    });
  });
});
