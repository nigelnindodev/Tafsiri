import { InventoryEntity, OrderItemEntity } from "../../../postgres/entities";

const isOrderItemInOrderV2 = (inventoryId: number, orderItemIds: number[]): boolean => {
    return orderItemIds.find(orderItemId => orderItemId === inventoryId) !== undefined;
};

export const InventoryItemSelectDuringOrder = (orderId: number, inventoryItems: InventoryEntity[], orderItemsInOrder: OrderItemEntity[]) => {
    console.log(inventoryItems);
    console.log(orderItemsInOrder);
    const orderItemIds = orderItemsInOrder.map(item => item.inventory.id);
    return (
        <details role="list">
            <summary aria-haspopup="listbox">Select Order Items</summary>
            <ul role="listbox">
                {inventoryItems.map(inventoryItem => {
                    return (
                        <li>
                            <label>
                                {
                                    isOrderItemInOrderV2(inventoryItem.id, orderItemIds) ?
                                        <input type="checkbox" hx-post={`/orders/item/change/${orderId}/${inventoryItem.id}`} hx-trigger="change" checked /> :
                                        <input type="checkbox" hx-post={`/orders/item/change/${orderId}/${inventoryItem.id}`} hx-trigger="change" />
                                }
                                {inventoryItem.name}
                            </label>
                        </li>
                    )
                })}
            </ul>
        </details>
    );
};
