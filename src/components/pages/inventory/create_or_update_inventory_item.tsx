import { InventoryEntity } from "../../../postgres/entities";

export const CreateOrUpdateInventoryComponent = (inventoryItem?: InventoryEntity) => {
    return (
        <div>
            <nav>
                <ul>
                    <li><strong>{inventoryItem === undefined ? "Create" : "Update"} Inventory</strong></li>
                </ul>
                <ul>
                    <li><a hx-get="/inventory/list" hx-target="#inventory-section" >&lt Back</a></li>
                </ul>
            </nav>
            <form>
                <div class="grid" >
                    <label for="name">
                        Name
                        <input value={inventoryItem?.name} type="text" id="name" name="name" placeholder="Product Name" required />
                        <small>i.e Coca Cocla 500ml</small>
                    </label>
                    <label for="price">
                        Price
                        <input value={inventoryItem?.price.toString()} type="number" id="price" name="price" placeholder="Price" required />
                    </label>
                </div>
                <button id="inventory-submit" type="submit" hx-post={inventoryItem === undefined ? "/inventory/create" : `/inventory/edit/{${inventoryItem.id}}`} hx-swap="outerHTML" hx-target="#inventory-submit">Submit</button>
            </form>
        </div>
    );
};
