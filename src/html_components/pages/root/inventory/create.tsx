export const CreateInventorySection = (
    <div>
        <h6>Create Inventory</h6>
        <div class="grid">
            <div>
                <button role="button" class="outline" hx-get="/inventory/list" hx-target="#inventory-section">Back</button>
            </div>
            <div />
            <div />
            <div />
        </div>
        <form>
            <div class="grid" >
                <label for="firstname">
                    Name
                    <input type="text" id="name" name="name" placeholder="Product Name" required />
                    <small>i.e Coca Cocla 500ml</small>
                </label>
                <label for="lastname">
                    Price
                    <input type="number" id="price" name="price" placeholder="Price" required />
                </label>
            </div>
            <button id="inventory-submit" type="submit" hx-post="/inventory/create" hx-swap="outerHTML" hx-target="#inventory-submit">Submit</button>
        </form>
    </div>
);
