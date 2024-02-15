import { PaymentTypes } from "../../../postgres/common/constants";
import { OrderItemEntity, PaymentEntity } from "../../../postgres/entities";
import { getTotalOrderCost } from "../../../services/common";

export const ActiveOrderItems = (orderId: number, orderItems: OrderItemEntity[], paymentEntity: PaymentEntity) => {
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
                                <div class="center">
                                    <h4>{item.inventory.name}</h4>
                                </div>
                                <div class="grid">
                                    <button hx-post={`/orders/item/updateQuantity/${item.id}/DEC`}>
                                        -
                                    </button>
                                    <div class="center">
                                        <h5>{item.quantity} item(s)</h5>
                                    </div>
                                    <button hx-post={`/orders/item/updateQuantity/${item.id}/INC`}>
                                        +
                                    </button>
                                </div>
                                <div class="center">
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
            <blockquote>
                <fieldset>
                    <legend>
                        Payment Type
                    </legend>
                    <label>
                        {
                            /**
                             * TODO: Should replace this ugly ternary here.
                            */
                            paymentEntity.paymentType === PaymentTypes.CASH ?
                                <input type="radio" id="cash" name="paymentType" value="cash" hx-post={`/orders/payment/updateType/${paymentEntity.id}`} checked /> :
                                <input type="radio" id="cash" name="paymentType" value="cash" hx-post={`/orders/payment/updateType/${paymentEntity.id}`} />
                        }
                        CASH</label>
                    <label>
                        {
                            paymentEntity.paymentType === PaymentTypes.MPESA ?
                                <input type="radio" id="mpesa" name="paymentType" value="mpesa" hx-post={`/orders/payment/updateType/${paymentEntity.id}`} checked /> :
                                <input type="radio" id="mpesa" name="paymentType" value="mpesa" hx-post={`/orders/payment/updateType/${paymentEntity.id}`} />
                        }
                        MPESA
                    </label>
                </fieldset>
            </blockquote>
            <progress id="confirm-progress-indicator" class="htmx-indicator" />
            {orderItems.length === 0 ? "" : <button class="contrast outline" hx-target="#create-order-section" hx-post={`/orders/confirm/${orderId}/${paymentEntity.id}`} hx-indicator="#confirm-progress-indicator">CONFIRM ORDER</button>}
        </details>
    );
};
