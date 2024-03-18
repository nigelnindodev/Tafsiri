import Elysia from "elysia"
import { DataSource } from "typeorm"
import { PaymentsPage } from "../components/pages/payments"
import { listPayments } from "../services/payments"
import { SwaggerTags } from "../services/common/constants"

export const paymentRoutes = (dataSource: DataSource) => {
    const app = new Elysia({ prefix: "/payments" })
    app.get("/", () => PaymentsPage, {
        detail: {
            summary: "Get Payments Page",
            description:
                "Returns HTMX markup for the main payments page, which by default will load all payments from the /payments/list endpoint",
            tags: [SwaggerTags.Payments.name],
        },
    }).get(
        "/list",
        async () => {
            return await listPayments(dataSource)
        },
        {
            detail: {
                summary: "Get Payments List Component",
                description:
                    "Returns HTMX markup that lists all recorded payments",
                tags: [SwaggerTags.Payments.name],
            },
        }
    )
    return app
}
