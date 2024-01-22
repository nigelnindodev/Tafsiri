import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { indexPage } from "./html_components/index";
import { nameResult } from "./html_components/name_result";

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .use(swagger())
  .get("/html", () => {
    return indexPage;
  })
  .post("/name", () => {
    return nameResult;
  })
  .get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
