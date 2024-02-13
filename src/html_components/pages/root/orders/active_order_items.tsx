import { InventoryEntity, OrderItemEntity } from "../../../../postgres/entities";

export const ActiveOrderItems = (orderId: number, orderItems: OrderItemEntity[]) => {
    return (
        <details open>
            <summary>Details</summary>
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
                                    <button>
                                        -
                                    </button>
                                    <div class='center'>
                                        <h5>{item.quantity} item(s)</h5>
                                    </div>
                                    <button>
                                        +
                                    </button>
                                </div>
                                <div class='center'>
                                    <h2><mark>{item.inventory.price * item.quantity}.00 KES</mark></h2>
                                </div>
                            </div>
                        </blockquote>
                    )
                })}
        </details>
    );
}
