import { InventoryEntity, OrderItemEntity } from "../../../../postgres/entities";

export const ActiveOrderItems = (orderId: number, orderItems: OrderItemEntity[], inventoryItems: InventoryEntity[]) => {
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
                                    <h4>Inventory Item Description</h4>
                                </div>
                                <div class="grid">
                                    <button>
                                        -
                                    </button>
                                    <div class='center'>
                                        <h5>1 item(s)</h5>
                                    </div>
                                    <button>
                                        +
                                    </button>
                                </div>
                                <div class='center'>
                                    <h2><mark>{item.id}.00 KES</mark></h2>
                                </div>
                            </div>
                        </blockquote>
                    )
                })}
        </details>
    );
}
