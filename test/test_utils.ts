import Elysia from "elysia";
import { testUser } from "./test_constants";

export const getTestBaseUrl = (app: Elysia): string => {
  return `http://${app.server?.hostname || "localhost"}:${app.server?.port || 3000}`;
};

/**
 * Logs in the test user and returns a the cookie value as a string
 * to be added in requests.
 */
export const loginTestUser = async (app: Elysia): Promise<string> => {
  const baseUrl = getTestBaseUrl(app);
  // Fine if fails because test user is already created
  await app.handle(
    new Request(`${baseUrl}/auth/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    }),
  );

  const loginResponse = await app.handle(
    new Request(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    }),
  );

  if (loginResponse.status !== 200) {
    throw new Error(
      `Failed to log in test user: ${await loginResponse.text()}`,
    );
  }

  const cookieValue = loginResponse.headers.get("set-cookie")?.split(";")[0];

  if (cookieValue === undefined) {
    throw new Error(
      `Failed to read cookie value from headers. Headers: ${loginResponse.headers}`,
    );
  }

  return cookieValue;
};
