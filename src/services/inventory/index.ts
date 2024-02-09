import { DataSource } from "typeorm";
import { insertInventoryItem } from "../../postgres/queries";

export const createInventoryItem = async (dataSource: DataSource, name: string, price: number) => {
	const result = await insertInventoryItem(dataSource, { name, price });
	console.log(result);
	// An error handling here
};
