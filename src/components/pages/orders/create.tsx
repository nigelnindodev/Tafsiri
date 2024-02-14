import { InventoryEntity } from "../../../postgres/entities";
import { InventoryItemSelectDuringOrder } from "./inventory_item_select_during_order";

export const CreateOrderSection = (orderId: number, inventoryData: InventoryEntity[]) => {
    return (
        <div>
            <nav>
                <ul>
                    <li><strong>Create Order</strong></li>
                </ul>
                <ul>
                    <li><a hx-get="/orders/list" hx-target="#orders-section">&lt Back</a></li>
                </ul>
            </nav>
            <div id="create-order-section">
                {InventoryItemSelectDuringOrder(orderId, inventoryData)}
                <div id="active-items" hx-get={`/orders/active/${orderId}`} hx-trigger="every 1s" />
            </div>
        </div>
    );
};
