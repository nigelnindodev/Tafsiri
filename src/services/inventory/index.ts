import { DataSource } from "typeorm";
import { getInventoryItems, insertInventoryItem } from "../../postgres/queries";
import { inventoryList } from "../../html_components/pages/root/inventory/inventory_list";

export const createInventoryItem = async (dataSource: DataSource, name: string, price: number) => {
	const result = await insertInventoryItem(dataSource, { name, price });
	console.log(result);
	return `<div class="container"><small>Added ${name} to inventory list</small></div>`;
};

export const listInventoryItems = async (dataSource: DataSource) => {
	const result = await getInventoryItems(dataSource);
	if (result.length === 0) {
		return `<div class="container"><small>No item currently in inventory</small></div>`;
	} else {
		return inventoryList(result);
	}
};
