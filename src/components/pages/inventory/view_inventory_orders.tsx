import {
    InventoryEntity,
    OrdersEntity,
} from "../../../postgres/entities/index";
import {
    createOrderItemsDescription,
    getTotalOrderCost,
} from "../../../services/common";
import { HtmxTargets } from "../../common/constants";
import { InfoWrapper } from "../../common/info_wrapper";

export const ViewInventoryItemOrdersComponent = (
    inventoryItem: InventoryEntity,
    orders: OrdersEntity[]
) => {
    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <strong>Orders for: {inventoryItem.name}</strong>
                    </li>
                </ul>
                <ul>
                    <li>
                        <a
                            hx-get="/inventory/list"
                            hx-target={`#${HtmxTargets.INVENTORY_SECTION}`}
                        >
                            &lt Back
                        </a>
                    </li>
                </ul>
            </nav>
            {orders.length === 0 ? (
                InfoWrapper(
                    `${inventoryItem.name} was not found in any completed orders`
                )
            ) : (
                <table>
                    <thead>
                        <th>Order Items</th>
                        <th>Total Price</th>
                        <th>Completed At</th>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            return (
                                <tr>
                                    <td>
                                        {createOrderItemsDescription(
                                            order.order_items
                                        )}
                                    </td>
                                    <td>
                                        {getTotalOrderCost(order.order_items)}
                                    </td>
                                    <td>{order.payment.updated_at}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};
