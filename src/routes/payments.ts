import Elysia from "elysia";
import { DataSource } from "typeorm";
import { PaymentsPage } from "../components/pages/payments";
import { listPayments } from "../services/payments";

export const paymentRoutes = (dataSource: DataSource) => {
  const app = new Elysia({ prefix: "/payments" });
  app
    .get("/", () => {
      return PaymentsPage;
    })
    .get("/list", async () => {
      return await listPayments(dataSource);
    });

  return app;
};
