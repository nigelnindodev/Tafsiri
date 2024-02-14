import { DataSource } from "typeorm";
import { getInventoryItems, getInventoryItemsByName, insertInventoryItem } from "../../postgres/queries";
import { inventoryList } from "../../components/pages/inventory/inventory_list";

export const createInventoryItem = async (dataSource: DataSource, name: string, price: number) => {
	const result = await insertInventoryItem(dataSource, { name, price });
	console.log(result);
	return `<div class="container">small>Added ${name} to inventory list</small></div>`;
};

export const listInventoryItems = async (dataSource: DataSource) => {
	const result = await getInventoryItems(dataSource);
	if (result.length === 0) {
		return `<div class="container"><small>No items currently in inventory. Click the add button to get started.</small></div>`;
	} else {
		return inventoryList(result);
	}
};

export const searchInventoryItems = async (dataSource: DataSource, name: string) => {
	const result = await getInventoryItemsByName(dataSource, name);
	console.log("Fetched matching inventory items");
	if (result.length === 0) {
		return `<div class="container"><small>No inventory items match search criteria '${name}'</small></div>`;
	} else {
		return inventoryList(result);
	}
};
