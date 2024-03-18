export const PaymentsPage = (
    <article>
        <header>
            <h1>Payments</h1>
        </header>
        <body>
            <div
                id="payments-section"
                hx-get="/payments/list"
                hx-trigger="load"
            />
        </body>
    </article>
);
