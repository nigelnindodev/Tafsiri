export const ViewInventorySection = (name: string) => {
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
            <h6>Inventory List</h6>
            <table role="grid">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>{name}</td>
                        <td>70.00 KES</td>
                        <td><button role="button" class="contrast outline">Orders</button></td>
                        <td><button role="button" class="outline">Edit</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
