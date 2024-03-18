import { DataSource } from "typeorm";
import * as queries from "../../postgres/queries";

import { InfoWrapper } from "../../components/common/info_wrapper";
import { CreateOrUpdateOrderSection } from "../../components/pages/orders/create";
import { ActiveOrderItems } from "../../components/pages/orders/active_order_items";
import { OrderStatus, PaymentTypes } from "../../postgres/common/constants";
import {
    filterForOrdersWithActiveOrders,
    filterOrderItemsForActiveItems,
    getTotalOrderCost,
    simulateNetworkLatency,
} from "../common";
import { orderCreateSuccess } from "../../components/pages/orders/order_create_success";
import { UnfinishedOrdersComponent } from "../../components/pages/orders/unfinished_orders";
import { logger } from "../..";

/**
 * Triggered by clicking create new order button in the UI.
 *
 * Initializes a new order and payment in so that we can keep track of the order even after exiting.
 *
 * This functions also sets the currently logged in user as the processor of the order.
 */
export const createOrder = async (dataSource: DataSource, userId: number) => {
    const initializeOrderResult = await queries.initializeOrder(
        dataSource,
        userId
    );
    // We should always have identifiers[0].id from TypeORM
    await queries.initializePayment(
        dataSource,
        initializeOrderResult.identifiers[0].id
    );
    const inventoryItems =
        await queries.getInventoryItemsOrderByName(dataSource);
    // Return empty array for orderItemsInOrder since their order was just created.
    return CreateOrUpdateOrderSection(
        initializeOrderResult.identifiers[0].id,
        inventoryItems,
        []
    );
};

/**
 * Almost the same as creation of an order, but allows for the resumption of an unfinished
 * order.
 *
 * Order and payment have already been initialized, so we we just need to load the order
 * items form the database.
 *
 * If a different user apart from the one who created the order resumes it, the order
 * will be assigned to them.
 */
export const resumeOrder = async (
    dataSource: DataSource,
    orderId: number,
    userId: number
) => {
    const inventoryItems =
        await queries.getInventoryItemsOrderByName(dataSource);
    const orderItems = await queries.getOrderItemsInOrder(dataSource, orderId);
    await queries.updateOrderOwner(dataSource, orderId, userId);
    return CreateOrUpdateOrderSection(
        orderId,
        inventoryItems,
        filterOrderItemsForActiveItems(orderItems)
    );
};

/**
 * Triggered in the UI when the inventory items have been finalized, and its to save the order
 * and payment.
 *
 * There are provision for pending payments, but we won't focus on that at the moment.
 *
 * We will assume that all payments have been completed once an order is confirmed.
 */
export const confirmOrder = async (
    dataSource: DataSource,
    orderId: number,
    payemntId: number
) => {
    await simulateNetworkLatency(2000);
    const getOrderResult = await queries.getOrderById(dataSource, orderId);
    const getPaymentResult = await queries.getPaymentByOrderId(
        dataSource,
        orderId
    );

    // ensure that both values are not null
    if (getOrderResult === null || getPaymentResult === null) {
        const message = `Missing order or payment. orderId: ${orderId} | paymentId: ${payemntId}`;
        logger.error(message);
        throw new Error(message);
    }

    // ensure that payment passed in matches its order
    if (getPaymentResult.id !== payemntId) {
        const message = `Payment id in request [${payemntId}] did not match id [${getPaymentResult.id}] for order with identifier: ${orderId}`;
        logger.error(message);
        throw new Error(message);
    }

    // ensure that order is already not in a completed state
    if (getOrderResult.status === OrderStatus.COMPLETED) {
        const message = `Order with id [${orderId}] is already in a completed state`;
        logger.error(message);
        throw new Error(message);
    }

    // get all the items in the order
    // if confirm button is shown in the UI, there should be active items in the order
    // We can go ahead and complete the order and payment as well
    const orderItems = await queries.getOrderItemsInOrder(dataSource, orderId);

    await queries.completeOrder(dataSource, orderId);
    await queries.completePayment(
        dataSource,
        payemntId,
        getTotalOrderCost(filterOrderItemsForActiveItems(orderItems))
    );
    return orderCreateSuccess;
};

export const activeOrders = async (dataSource: DataSource, orderId: number) => {
    const orderItems = await queries.getOrderItemsInOrder(dataSource, orderId);
    const getPaymentResult = await queries.getPaymentByOrderId(
        dataSource,
        orderId
    );
    if (getPaymentResult === null) {
        const message = `Failed to get payment for order with id: ${orderId}`;
        logger.error(message);
        throw new Error(message);
    }
    return ActiveOrderItems(
        orderId,
        filterOrderItemsForActiveItems(orderItems),
        getPaymentResult
    );
};

/**
 * Updates the number of inventory items for a specific item in an order.
 *
 * Currently the UI has a '-' and '+' button that allows for unit size changes.
 *
 * This was decided to prevent users having to actually input the values themselves, which
 * can be tiresome and also error prone.
 *
 * Maybe in the future we might expand this to just, or also, accept a number to update the inventory items to.
 *
 * But for now, the backend will update the number through the "INC" and "DEC" commands as appropriate.
 *
 */
export const updateItemCounter = async (
    dataSource: DataSource,
    itemId: number,
    updateType: string
) => {
    // ignore unknown actions
    if (updateType !== "INC" && updateType !== "DEC") {
        logger.warn(
            `Unkown updateType of ${updateType} passed to updateItemCounter function`
        );
        return;
    }

    const orderItem = await queries.getOrderItemById(dataSource, itemId);

    // ignore if order item is null
    if (orderItem === null) {
        logger.warn(`Order item with id ${itemId} not found`);
        return;
    }

    // ignore if counter already at 1 and decrement action passed in
    if (orderItem.quantity === 1 && updateType === "DEC") {
        logger.warn(`Order item with id ${itemId} is already at lowest value`);
        return;
    }

    await queries.updateOrderItemCount(
        dataSource,
        itemId,
        updateType === "DEC" ? orderItem.quantity - 1 : orderItem.quantity + 1
    );
};

/**
 * This returns a list of orders that have not been completed for one reason or another.
 *
 * Criteria above has been updated; the order needs to be unfinished and also have active order items as well.
 *
 * An example is a user clicking the back button by mistake.
 *
 * This endpoint returns a list of all unfinished orders, so that it can be resumed.
 */
export const listUnfinishedOrders = async (dataSource: DataSource) => {
    const result = await queries.getOrders(dataSource);
    if (result.length === 0) {
        return InfoWrapper("No orders made yet. Create first order");
    } else {
        const unfinishedOrders =
            await queries.getUnfinishedOrderItems(dataSource);
        const filteredOrders =
            filterForOrdersWithActiveOrders(unfinishedOrders);
        if (filteredOrders.length === 0) {
            return InfoWrapper("No recent unfinished orders.");
        } else {
            return UnfinishedOrdersComponent(filteredOrders);
        }
    }
};

/**
 * Triggered by a user selecting/deselecting an inventory item in the create order section.
 *
 * Adds an item to the order if doesn't already exist, or toggles its active state to "remove" it from the order.
 *
 * "Remove" in quotes because the backend doesn't actually remove it, just deactivates it. This enables easier addition back if removed by mistake, and also will still contain it's previous context.
 */
export const addOrRemoveOrderItem = async (
    dataSource: DataSource,
    orderId: number,
    inventoryId: number
) => {
    const orderItem = await queries.getOrderItemByInventoryId(
        dataSource,
        orderId,
        inventoryId
    );
    const inventory = await queries.getInventoryItemById(
        dataSource,
        inventoryId
    );

    if (orderItem === null) {
        if (inventory === null) {
            const message = `Cannot create order item with a missing inventory item. Passed in inventory id is [${inventoryId}]`;
            logger.error(message);
            throw new Error(message);
        } else {
            logger.trace("Item doesn't exist in order, creating it.");
            const insertOrderItemResult = await queries.insertOrderitem(
                dataSource,
                orderId,
                inventoryId
            );
            await queries.insertOrderPrice(
                dataSource,
                insertOrderItemResult.identifiers[0].id,
                inventory.price
            );
        }
    } else {
        logger.trace("Item already exists in order. Toggling active state");
        await queries.toggleOrderItem(
            dataSource,
            orderItem.id,
            !orderItem.active
        );
    }
};

/**
 * Updates the payment type radio buttons to show which payment type (currently CASH & M-Pesa) is to be associated with this transaction.
 */
export const updatePaymentTypeForOrder = async (
    dataSource: DataSource,
    paymentId: number,
    paymentType: PaymentTypes
) => {
    const getPaymentResult = await queries.getPaymentById(
        dataSource,
        paymentId
    );

    if (getPaymentResult === null) {
        const message = `Cannot update payment type as payment with id: ${paymentId} not found`;
        logger.error(message);
        throw new Error(message);
    }

    await queries.updatePaymentType(dataSource, paymentId, paymentType);
};
