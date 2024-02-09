export const ViewInventorySection = () => {
    return (
        <div>
            <div class="grid">
                <div>
                    <input type="search" id="search" name="search" placeholder="Search Inventory" />
                </div>
                <div>
                    <div class="grid">
                        <div></div>
                        <div>
                            <button role="button" class="outline" hx-get="/inventory/create" hx-target="#inventory-section">Add New</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="inventory-data" hx-get="/inventory/list/all" hx-trigger="load" />
        </div>
    );
};
