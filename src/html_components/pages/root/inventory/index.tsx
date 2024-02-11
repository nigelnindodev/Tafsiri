export const InventoryPage = (
    <article>
        <header>
            <h1>
                Inventory
            </h1>
        </header>
        <body>
            <div id="inventory-section" hx-get="/inventory/list" hx-trigger="load" />
        </body>
    </article>
);
