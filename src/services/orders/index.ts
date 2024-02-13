import { DataSource } from "typeorm";
import { getInventoryItemsOrderByName, getOrderItemsInOrder, getOrders, initializeOrder, insertOrderitem } from "../../postgres/queries";
import { InfoWrapper } from "../../html_components/common/info_wrapper";
import { CreateOrderSection } from "../../html_components/pages/root/orders/create";

export const createOrder = async (dataSource: DataSource) => {
	try {
		const initializeOrderResult = await initializeOrder(dataSource);
		const inventoryItems = await getInventoryItemsOrderByName(dataSource);
		// We should always have identifiers.id
		return CreateOrderSection(initializeOrderResult.identifiers[0].id, inventoryItems);

	} catch (e) {
		console.log(e);
		return "error";
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
	const orderItemsInOrder = await getOrderItemsInOrder(dataSource, orderId);
	const orderItem = orderItemsInOrder.filter(item => item.invetory.id === inventoryId);

	if (orderItem.length === 0) {
		console.log("Item doesn't exist in order, creating it.");
		await insertOrderitem(dataSource, orderId, inventoryId);
	} else {
		console.log("Item already exists in order");
	}
}
