import Elysia from "elysia";
import { DataSource } from "typeorm";
import { PaymentsPage } from "../components/pages/payments";
import { listPayments } from "../services/payments";
import { authPlugin } from "../plugins/auth";

export const paymentRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/payments" });
  app
    .use(authPlugin())
    .get("/", () => {
      return PaymentsPage;
    })
    .get("/list", async () => {
      return await listPayments(dataSource);
    });

  return app;
};
