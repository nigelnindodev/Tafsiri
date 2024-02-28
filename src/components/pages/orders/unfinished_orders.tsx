import { OrdersEntity, OrderItemEntity } from "../../../postgres/entities";
import { createOrderItemsDescription, filterOrderItemsForActiveItems, getTotalOrderCost } from "../../../services/common";

const unfinishedItemRowDescription = (orderItems: OrderItemEntity[]): string => {
    // We should have some active items due to 'getUnfinishedOrderItems' query
    const activeOrderItems = filterOrderItemsForActiveItems(orderItems);
    return createOrderItemsDescription(activeOrderItems);
};

export const UnfinishedOrdersComponent = (unfinishedOrderitems: OrdersEntity[]) => {
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
                                <td>{unfinishedItemRowDescription(item.order_items)}</td>
                                <td><strong>{getTotalOrderCost(filterOrderItemsForActiveItems(item.order_items))}.00 KES</strong></td>
                                <td><button role="button" class="secondary outline" hx-get={`/orders/resume/${item.id}`} hx-target="#orders-section">Resume</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};
