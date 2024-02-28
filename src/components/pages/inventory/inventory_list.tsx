import { InventoryEntity } from "../../../postgres/entities";

export const inventoryList = (inventoryItems: InventoryEntity[]) => {
    return (
        <div>
            <h6>Inventory List</h6>
            <table role="grid">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inventoryItems.map(inventoryItem => {
                        return (
                            <tr>
                                <td>{inventoryItem.id}</td>
                                <td>{inventoryItem.name}</td>
                                <td><strong>{inventoryItem.price}.00 KES</strong></td>
                                <td><button role="button" class="secondary" hx-get={`/inventory/orders/${inventoryItem.id}`} hx-target="#inventory-section">View Orders</button><button role="button" class="contrast outline" hx-get={`/inventory/edit/${inventoryItem.id}`} hx-target="#inventory-section">Edit</button></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
