import { DataSource } from "typeorm";
import { insertInventoryItem } from "../../postgres/queries";

export const createInventoryItem = async (dataSource: DataSource, name: string, price: number) => {
	const result = await insertInventoryItem(dataSource, { name, price });
	console.log(result);
	return `<div class="container"><ins>Added ${name} to inventory list</ins></div>`;
};

export const listInventoryItems = async (dataSource: DataSource) => {

};
