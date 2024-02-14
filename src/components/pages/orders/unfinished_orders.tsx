import { OrderEntity, OrderItemEntity } from "../../../postgres/entities";
import { filterOrderItemsForActiveItems } from "../../../services/common";

const unfinishedItemRowDescription = (orderItems: OrderItemEntity[]): string => {
    // We should have some active items due to 'getUnfinishedOrderItems' query
    const activeOrderItems = filterOrderItemsForActiveItems(orderItems);
    let finalString = "";
    activeOrderItems.forEach((item, index) => {
        if (index < activeOrderItems.length - 1) {
            finalString = finalString + `${item.quantity} x ${item.inventory.name} | `;
        } else {
            finalString = finalString + `${item.quantity} x ${item.inventory.name}`;
        }
    });
    return finalString;
};

export const UnfinishedOrdersComponent = (unfinishedOrderitems: OrderEntity[]) => {
    return (
        <div>
            <h6>Latest Unfished Orders</h6>
            <table role="grid">
                <thead>
                    <th>Items Description</th>
                    <th>Total Price</th>
                    <th>Actions</th>
                </thead>
                <tbody>
                    {unfinishedOrderitems.map(item => {
                        return (
                            <tr>
                                <td>{unfinishedItemRowDescription(item.orderItems)}</td>
                                <td>Add total bill here</td>
                                <td><button role="button" class="secondary outline" hx-get={`/orders/resume/${item.id}`} hx-target="#orders-section">Resume</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};
