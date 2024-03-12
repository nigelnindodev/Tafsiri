import { describe, expect, it } from "bun:test";

import { createApplicationServer } from "../src/server.ts";
import { PostgresDataSourceSingleton } from "../src/postgres/index.ts";

describe("Server Testing", async () => {
  const dataSource = await PostgresDataSourceSingleton.getInstance();
  it("Correcly loads up the test server", async () => {
    const app = createApplicationServer(dataSource);
    const response = await app
      .handle(new Request("http://localhost:3000"))
      .then((res) => res.status);
    expect(response).toBe(200);
  });
});
