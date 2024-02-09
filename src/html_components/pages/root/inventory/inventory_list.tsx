import { InventoryEntity } from "../../../../postgres/entities";

export const inventoryList = (data: InventoryEntity[]) => {
    return (
        <div>
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
                    {data.map(item => {
                        return (
                            <tr>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.price}.00 KES</td>
                                <td><button role="button" class="contrast outline">Orders</button></td>
                                <td><button role="button" class="outline">Edit</button></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
