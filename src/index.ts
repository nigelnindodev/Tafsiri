import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

import { indexPage } from "./html_components/index";

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .use(swagger())
  .get("/html", () => {
    return indexPage;
  })
  .get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
