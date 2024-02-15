export const OrdersPage = (
    <article>
        <header>
            <h1>
                Orders
            </h1>
        </header>
        <body>
            <div id="orders-section" hx-get="/orders/list" hx-trigger="load" />
        </body>
    </article>
);
