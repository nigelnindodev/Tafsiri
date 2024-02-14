import { OrderEntity } from "../../../postgres/entities";

export const UnfinishedOrdersComponent = (unfinishedOrderitems: OrderEntity[]) => {
    return (
        <div>
            <h6>Latest Unfished Orders</h6>
            <table role="grid">
                <thead>
                    <th>Items Description</th>
                    <th>Total Price</th>
                </thead>
                <tbody>
                    {unfinishedOrderitems.map(item => {
                        return (
                            <tr>
                                <td>Update Item Description Here</td>
                                <td>Add total bill here</td>
                                <td><button role="button" class="secondary" hx-get={`/orders/resume/${item.id}`}>Resume</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};
