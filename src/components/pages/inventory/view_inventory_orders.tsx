import { InventoryEntity, OrderEntity } from "../../../postgres/entities/index"

export const ViewInventoryItemOrdersComponent = (inventoryItem: InventoryEntity, orders: OrderEntity[]) => {
    return (
        <div>
            <nav>
                <ul>
                    <li><strong>Orders for: {inventoryItem.name}</strong></li>
                </ul>
                <ul>
                    <li><a hx-get="/inventory/list" hx-target="#inventory-section">&lt Back</a></li>
                </ul>
            </nav>
        </div >
    );
};
