import { DataSource } from "typeorm";
import * as queries from "../../postgres/queries";
import { inventoryList } from "../../components/pages/inventory/inventory_list";
import { ViewInventoryItemOrdersComponent } from "../../components/pages/inventory/view_inventory_orders";

export const createInventoryItem = async (dataSource: DataSource, name: string, price: number) => {
	const result = await queries.insertInventoryItem(dataSource, { name, price });

	return `<div class="container">small>Added ${name} to inventory list</small></div>`;
};

export const listInventoryItems = async (dataSource: DataSource) => {
	const result = await queries.getInventoryItems(dataSource);

	if (result.length === 0) {
		return `<div class="container"><small>No items currently in inventory. Click the add button to get started.</small></div>`;
	} else {
		return inventoryList(result);
	}
};

export const searchInventoryItems = async (dataSource: DataSource, name: string) => {
	const result = await queries.getInventoryItemsByName(dataSource, name);

	if (result.length === 0) {
		return `<div class="container"><small>No inventory items match search criteria '${name}'</small></div>`;
	} else {
		return inventoryList(result);
	}
};

export const listInventoryItemOrders = async (dataSource: DataSource, inventoryId: number) => {
	try {
		const getInventoryItemResult = await queries.getInventoryItemById(dataSource, inventoryId);

		if (getInventoryItemResult === null) {
			const message = `Failed to find inventory item with id [${inventoryId}]`;
			console.error(message);
			throw new Error(message);
		}

		const ordersWithInventoryItem = await queries.getCompleteOrdersWithInventoryItems(dataSource, [getInventoryItemResult.id]);

		return ViewInventoryItemOrdersComponent(getInventoryItemResult, ordersWithInventoryItem);
	} catch (e) {
		console.error(e);
		throw (e);
	}
};
