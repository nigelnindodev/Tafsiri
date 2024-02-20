import { InventoryEntity, OrderItemEntity } from "../../../postgres/entities";
import { ServerHxTriggerEvents } from "../../../services/common/constants";
import { InventoryItemSelectDuringOrder } from "./inventory_item_select_during_order";

export const CreateOrUpdateOrderSection = (orderId: number, inventoryData: InventoryEntity[], orderItemsInOrder: OrderItemEntity[]) => {
    return (
        <div>
            <nav>
                <ul>
                    <li><strong>Create Order</strong></li>
                </ul>
                <ul>
                    <li><a class="contrast" hx-get="/orders/list" hx-target="#orders-section">&lt Back</a></li>
                </ul>
            </nav>
            <div id="create-order-section">
                {InventoryItemSelectDuringOrder(orderId, inventoryData, orderItemsInOrder)}
                <div id="active-items" hx-get={`/orders/active/${orderId}`} hx-trigger={`load, ${ServerHxTriggerEvents.REFRESH_ORDER} from:body`} />
            </div>
        </div>
    );
};
