import { tailwind } from "@gtramontina.com/elysia-tailwind";
import Elysia from "elysia";

export const tailWindPlugin = () => {
  const app = new Elysia().use(tailwind({
    path: "./public/stylesheet.css",
    source: "./public/tailwind.css",
    config: "./tailwind.config.ts",
    options: {
      minify: false,
      map: false,
      autoprefixer: false
    }
  }));
  return app;
};
