import { DataSource } from "typeorm";
import { completeOrder, completePayment, getInventoryItemsOrderByName, getOrderById, getOrderItemById, getOrderItemWithInventoryDetails, getOrderItemsInOrder, getOrders, getPaymentById, getPaymentByOrderId, getUnfinishedOrderItems, initializeOrder, initializePayment, insertOrderitem, toggleOrderItem, updateOrderItemCount, updatePaymentType } from "../../postgres/queries";
import { InfoWrapper } from "../../components/common/info_wrapper";
import { CreateOrUpdateOrderSection } from "../../components/pages/orders/create";
import { ActiveOrderItems } from "../../components/pages/orders/active_order_items";
import { OrderStatus, PaymentTypes } from "../../postgres/common/constants";
import { filterForOrdersWithActiveOrders, filterOrderItemsForActiveItems, getTotalOrderCost } from "../common";
import { orderCreateSuccess } from "../../components/pages/orders/order_create_success";
import { UnfinishedOrdersComponent } from "../../components/pages/orders/unfinished_orders";

/**
 * Triggered by clicking create new order button in the UI.
 *
 * Initializes a new order and payment in so that we can keep track of the order even after exiting.
 */
export const createOrder = async (dataSource: DataSource) => {
	try {
		const initializeOrderResult = await initializeOrder(dataSource);
		// We should always have identifiers[0].id from TypeORM
		await initializePayment(dataSource, initializeOrderResult.identifiers[0].id);
		const inventoryItems = await getInventoryItemsOrderByName(dataSource);
		return CreateOrUpdateOrderSection(initializeOrderResult.identifiers[0].id, inventoryItems);

	} catch (e) {
		console.log(e);
		throw (e);
	}
};

/**
 * Almost the same as creation of an order, but allows for the resumption of an unfinished
 * order.
 *
 * Order and payment have already been initialized, so we we just need to load the order
 * items form the database.
 */
export const resumeOrder = async (dataSource: DataSource, orderId: number) => {
	try {
		const inventoryItems = await getInventoryItemsOrderByName(dataSource);
		return CreateOrUpdateOrderSection(orderId, inventoryItems);
	} catch (e) {
		console.log(e);
		throw (e);
	}
};

/**
 * Triggered in the UI when the inventory items have been finalized, and its to save the order
 * and payment.
 * 
 * There are provision for pending payments, but we won't focus on that at the moment. 
 *
 * We will assume that all payments have been completed once an order is confirmed.
 */
export const confirmOrder = async (dataSource: DataSource, orderId: number, payemntId: number) => {
	try {
		const getOrderResult = await getOrderById(dataSource, orderId);
		const getPaymentResult = await getPaymentByOrderId(dataSource, orderId);

		// ensure that both values are not null
		if (getOrderResult === null || getPaymentResult === null) {
			const message = `Missing order or payment. orderId: ${orderId} | paymentId: ${payemntId}`;
			console.error(message);
			throw new Error(message);
		}

		// ensure that payment passed in matches its order
		if (getPaymentResult.id !== payemntId) {
			const message = `Payment id in request [${payemntId}] did not match id [${getPaymentResult.id}] for order with identifier: ${orderId}`
			console.error(message);
			throw new Error(message);
		}

		// ensure that order is already not in a completed state
		if (getOrderResult.status === OrderStatus.COMPLETED) {
			const message = `Order with id [${orderId}] is already in a completed state`;
			console.error(message);
			throw new Error(message);
		}

		// get all the items in the order
		// if confirm button is shown in the UI, there should be active items in the order
		// We can go ahead and complete the order and payment as well
		const orderItems = await getOrderItemsInOrder(dataSource, orderId);

		await completeOrder(dataSource, orderId);
		await completePayment(dataSource, payemntId, getTotalOrderCost(filterOrderItemsForActiveItems(orderItems)));
		return orderCreateSuccess;
	} catch (e) {
		console.log(e);
		throw (e);
	}
};

export const activeOrders = async (dataSource: DataSource, orderId: number) => {
	try {
		const orderItems = await getOrderItemsInOrder(dataSource, orderId);
		const getPaymentResult = await getPaymentByOrderId(dataSource, orderId);
		if (getPaymentResult === null) {
			const message = `Failed to get payment for order with id: ${orderId}`;
			console.error(message);
			throw new Error(message);
		}
		return ActiveOrderItems(orderId, filterOrderItemsForActiveItems(orderItems), getPaymentResult);
	} catch (e) {
		console.error(e);
		throw (e);
	}
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
 */
export const updateItemCounter = async (dataSource: DataSource, itemId: number, updateType: string) => {
	try {
		// ignore unknown actions
		if (updateType !== "INC" && updateType !== "DEC") {
			console.warn(`Unkown updateType of ${updateType} passed to updateItemCounter function`);
			return;
		}

		const orderItem = await getOrderItemById(dataSource, itemId);

		// ignore if order item is null
		if (orderItem === null) {
			console.warn(`Order item with id ${itemId} not found`);
			return;
		}

		// ignore if counter already at 1 and decrement action passed in 
		if (orderItem.quantity === 1 && updateType === "DEC") {
			console.warn(`Order item with id ${itemId} is already at lowest value`);
			return;
		}

		await updateOrderItemCount(dataSource, itemId, updateType === "DEC" ? orderItem.quantity - 1 : orderItem.quantity + 1);

	} catch (e) {
		console.error(e);
		throw (e);
	}
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
	try {
		const result = await getOrders(dataSource);
		if (result.length === 0) {
			return InfoWrapper("No orders made yet. Create first order");
		} else {
			const unfinishedOrders = await getUnfinishedOrderItems(dataSource);
			const filteredOrders = filterForOrdersWithActiveOrders(unfinishedOrders);
			if (filteredOrders.length === 0) {
				return InfoWrapper("No recent unfinished orders.");
			}
			else {
				return UnfinishedOrdersComponent(filteredOrders);
			}
		}
	} catch (e) {
		console.error(e);
		throw (e);
	}

};

/**
 * Triggered by a user selecting/deselecting an inventory item in the create order section.
 *
 * Adds an item to the order if doesn't already exist, or toggles its active state to "remove" it from the order.
 *
 * "Remove" in quotes because the backend doesn't actually remove it, just deactivates it. This enables easier addition back if removed errorneously, and also will still contain it's previous context.
 */
export const addOrRemoveOrderItem = async (dataSource: DataSource, orderId: number, inventoryId: number) => {
	try {
		const orderItem = await getOrderItemWithInventoryDetails(dataSource, orderId, inventoryId);
		console.log(orderItem);

		if (orderItem === null) {
			console.log("Item doesn't exist in order, creating it.");
			await insertOrderitem(dataSource, orderId, inventoryId);
		} else {
			console.log("Item already exists in order. Toggling active state");
			await toggleOrderItem(dataSource, orderItem.id, !orderItem.active);
		}
	} catch (e) {
		console.error(e);
		throw (e);
	}
}

/**
 * Updates the payment type radio buttons to show which payment type (currently CASH & M-Pesa) is to be associated with this transaction.
 */
export const updatePaymentTypeForOrder = async (dataSource: DataSource, paymentId: number, paymentType: PaymentTypes) => {
	try {
		const getPaymentResult = await getPaymentById(dataSource, paymentId);

		if (getPaymentResult === null) {
			const message = `Cannot update payment type as payment with id: ${paymentId} not found`;
			console.error(message);
			throw new Error(message);
		}

		await updatePaymentType(dataSource, paymentId, paymentType);
	} catch (e) {
		console.error(e);
		throw (e);
	}
};
