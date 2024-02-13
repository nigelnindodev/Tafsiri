import { DataSource } from "typeorm";
import { getInventoryItemsOrderByName, getOrderItem, getOrderItemWithInventoryDetails, getOrderItemsInOrder, getOrders, getPaymentById, getPaymentByOrderId, initializeOrder, initializePayment, insertOrderitem, toggleOrderItem, updateOrderItemCount, updatePaymentType } from "../../postgres/queries";
import { InfoWrapper } from "../../html_components/common/info_wrapper";
import { CreateOrderSection } from "../../html_components/pages/root/orders/create";
import { ActiveOrderItems } from "../../html_components/pages/root/orders/active_order_items";
import { PaymentTypes } from "../../postgres/common/constants";

export const createOrder = async (dataSource: DataSource) => {
	try {
		const initializeOrderResult = await initializeOrder(dataSource);
		await initializePayment(dataSource, initializeOrderResult.identifiers[0].id);
		const inventoryItems = await getInventoryItemsOrderByName(dataSource);
		// We should always have identifiers.id
		return CreateOrderSection(initializeOrderResult.identifiers[0].id, inventoryItems);

	} catch (e) {
		console.log(e);
		return "error";
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
		return ActiveOrderItems(orderId, orderItems.filter(item => item.active === true), getPaymentResult);
	} catch (e) {
		console.error(e);
		throw (e);
	}
};

export const updateItemCounter = async (dataSource: DataSource, itemId: number, updateType: string) => {
	try {
		// ignore unknon actions
		if (updateType !== "INC" && updateType !== "DEC") {
			console.warn(`Unkown updateType of ${updateType} passed to updateItemCounter function`);
			return;
		}

		const orderItem = await getOrderItem(dataSource, itemId);

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

export const processCreatedOrder = async (dataSource: DataSource) => { };

export const listOrders = async (dataSource: DataSource) => {
	const result = await getOrders(dataSource);
	if (result.length === 0) {
		return InfoWrapper("No orders made yet. Create first order");
	} else {
		return "<div>Not implemented</div>";
	}
};

export const updateOrderItem = async (dataSource: DataSource, orderId: number, inventoryId: number) => {
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
