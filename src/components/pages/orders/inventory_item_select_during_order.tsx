import { InventoryEntity } from "../../../postgres/entities";

export const InventoryItemSelectDuringOrder = (orderId: number, data: InventoryEntity[]) => {
    return (
        <details role="list">
            <summary aria-haspopup="listbox">Select Order Items</summary>
            <ul role="listbox">
                {data.map(item => {
                    return (
                        <li>
                            <label>
                                <input type="checkbox" hx-post={`/orders/item/change/${orderId}/${item.id}`} hx-trigger="change" />
                                {item.name}
                            </label>
                        </li>
                    )
                })}
            </ul>
        </details>
    );
};
