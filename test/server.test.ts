import "reflect-metadata"; // required for TypeORM

import { describe, expect, test } from "bun:test";

import { createApplicationServer } from "../src/server.ts";
import { PostgresDataSourceSingleton } from "../src/postgres/index.ts";

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

    test("Response htmx should include markup that loads the root component", () => {});
  });
});
