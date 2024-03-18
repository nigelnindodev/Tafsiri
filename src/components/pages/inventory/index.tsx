import { HtmxTargets } from "../../common/constants";

export const InventoryPage = (
    <article>
        <header>
            <h1>Inventory</h1>
        </header>
        <body>
            <div
                id={HtmxTargets.INVENTORY_SECTION}
                hx-get="/inventory/list"
                hx-trigger="load"
            />
        </body>
    </article>
);
