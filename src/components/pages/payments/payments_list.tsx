import { OrdersEntity } from "../../../postgres/entities";
import { createOrderItemsDescription, getTotalOrderCost } from "../../../services/common";

/**
 * Remember to pass in an order entiry with full detials. an betched from getCompletedOrders
 * function.
 */
export const PaymentsListComponent = (orders: OrdersEntity[]) => {
    return (
        <div>
            <h6>Payments List</h6>
            <table role="grid">
                <thead>
                    <tr>
                        <th>Items</th>
                        <th>Price</th>
                        <th>Payment Type</th>
                        <th>Completed At</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => {
                        return (
                            <tr>
                                <td>{createOrderItemsDescription(order.order_items)}</td>
                                <td><strong>{getTotalOrderCost(order.order_items)}.00 KES</strong></td>
                                <td>{order.payment.payment_type}</td>
                                <td>{order.payment.updated_at}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
};
