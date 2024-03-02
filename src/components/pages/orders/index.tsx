import { HtmxTargets } from "../../common/constants";

export const OrdersPage = (
    <article>
        <header>
            <h1>
                Orders
            </h1>
        </header>
        <body>
            <div id={HtmxTargets.ORDERS_SECTION} hx-get="/orders/list" hx-trigger="load" />
        </body>
    </article>
);
