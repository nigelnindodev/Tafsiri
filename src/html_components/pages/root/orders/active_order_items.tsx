import { InventoryEntity, OrderItemEntity } from "../../../../postgres/entities";
import { getTotalOrderCost } from "../../../../services/common";

export const ActiveOrderItems = (orderId: number, orderItems: OrderItemEntity[]) => {
    return (
        <details open>
            <summary>
                Details
            </summary>
            {orderItems.length === 0 ?
                <strong>Select order items above to get started.</strong>
                :
                orderItems.map(item => {
                    return (
                        <blockquote>
                            <div class="grid">
                                <div>
                                    <h4>{item.inventory.name}</h4>
                                </div>
                                <div class="grid">
                                    <button hx-post={`/orders/item/updateQuantity/${item.id}/DEC`}>
                                        -
                                    </button>
                                    <div class='center'>
                                        <h5>{item.quantity} item(s)</h5>
                                    </div>
                                    <button hx-post={`/orders/item/updateQuantity/${item.id}/INC`}>
                                        +
                                    </button>
                                </div>
                                <div class='center'>
                                    <h3><mark>{item.inventory.price * item.quantity}.00 KES</mark></h3>
                                </div>
                            </div>
                        </blockquote>
                    )
                })
            }
            <blockquote>
                <div class="grid">
                    <div>
                        <h3>TOTAL COST :</h3>
                    </div>
                    <div>
                        <h2><mark>{getTotalOrderCost(orderItems)}.00 KES</mark></h2>
                    </div>
                    <div />
                    <div />
                </div>
            </blockquote>
        </details>
    );
};
