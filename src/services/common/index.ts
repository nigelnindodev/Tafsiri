/**
 * setTimeout calls here are only used to slow down requests to simulate network latency, so that progress
 * indicators in the UI can be confrimed to be working.
 *
 * TODO; Add catch all setTimeout middleware when environemnt is dev/local, and disable when prod. This can help with simulating network latency.
 */
import { setTimeout } from "timers/promises";

import { OrdersEntity, OrderItemEntity } from "../../postgres/entities";
import { logger } from "../..";

/**
 * Ensure when calling this funtion, the query for fetching order item entities should
 * also join with the inventory table, else will lead to undefined errors.
 *
 * TODO: Maybe come up with a way to type with requirement?
 * TODO: What if an order is unfinshed and the price changes in the inventory list? We need to handle that as well.
 */
export const getTotalOrderCost = (orderItems: OrderItemEntity[]): number => {
    logger.trace("orderItems on getTotalOrderCost", orderItems);
    if (orderItems.length === 0) {
        return 0;
    } else {
        let totalCost = 0;
        orderItems.forEach((item) => {
            logger.trace("individual order item on getTotalOrderCost", item);
            totalCost += item.quantity * item.order_item_price.price;
        });
        return totalCost;
        // above forEach can be further simplified with reduce call
    }
};

/**
 * Gets a list of order entities and filters out the list to return orders with oly active
 * items.
 *
 * Currently only used for order items not in a completed status, but there may be a use case
 * in the future for other statuses as well, tis hsould support that as well without any changes.
 *
 * TODO: Not very well optimized in the forEach loop. We might be able to early stop as soon as
 * an active order item is found.
 */
export const filterForOrdersWithActiveOrders = (
    orders: OrdersEntity[]
): OrdersEntity[] => {
    return orders.filter((item) => {
        let activeOrderFound = false;
        item.order_items.forEach((orderItem) => {
            if (orderItem.active === true) {
                activeOrderFound = true;
            }
        });
        return activeOrderFound;
    });
};

export const filterOrderItemsForActiveItems = (
    orderItems: OrderItemEntity[]
): OrderItemEntity[] => {
    return orderItems.filter((item) => item.active === true);
};

/**
 * Creates a string description of order items from an array.
 * Expects OrderItemEntity obbjects to also have `inventory` property defined.
 */
export const createOrderItemsDescription = (
    orderItems: OrderItemEntity[]
): string => {
    let returnString = "";
    orderItems.forEach((item, index) => {
        if (index < orderItems.length - 1) {
            returnString =
                returnString +
                `${item.quantity} x ${item.inventory.name} <ins>|</ins> `;
        } else {
            returnString =
                returnString + `${item.quantity} x ${item.inventory.name}`;
        }
    });
    return returnString;
};

export const simulateNetworkLatency = async (
    latencyMilliseconds: number
): Promise<void> => {
    await setTimeout(latencyMilliseconds);
};
