import "reflect-metadata"; // required for TypeORM

import { describe, expect, it } from "bun:test";

import { createApplicationServer } from "../src/server.ts";
import { PostgresDataSourceSingleton } from "../src/postgres/index.ts";

describe("Server Testing", async () => {
  console.log("NODE_ENV: ", process.env.NODE_ENV);
  const dataSource = await PostgresDataSourceSingleton.getInstance();
  console.log("Fetched postgres datasource");
  const app = createApplicationServer(dataSource);
  it("Correcly loads up the test server", async () => {
    const response = await app
      .handle(new Request("http://localhost:3000"))
      .then((res) => res.status);
    expect(response).toBe(200);
  });
  it("Fails", async () => {
    expect(1).toBe(2);
  });
});
