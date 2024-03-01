import { DataSource } from "typeorm";
import * as queries from "../../postgres/queries";
import { inventoryList } from "../../components/pages/inventory/inventory_list";
import { ViewInventoryItemOrdersComponent } from "../../components/pages/inventory/view_inventory_orders";
import { InfoWrapper } from "../../components/common/info_wrapper";
import { CreateOrUpdateInventoryComponent } from "../../components/pages/inventory/create_or_update_inventory_item";

export const createInventoryItem = async (
  dataSource: DataSource,
  name: string,
  price: number,
) => {
  await queries.insertInventoryItem(dataSource, { name, price });
  return InfoWrapper(`Added ${name} to inventory list`);
};

export const getInventoryItemForUpdate = async (
  dataSource: DataSource,
  inventoryId: number,
) => {
  const inventoryItem = await queries.getInventoryItemById(
    dataSource,
    inventoryId,
  );
  if (inventoryItem === null) {
    const message = `Inventory item with id [${inventoryId}] not found`;
    console.log(message);
    throw new Error(message);
  } else {
    return CreateOrUpdateInventoryComponent(inventoryItem);
  }
};

export const updateInventoryItem = async (
  dataSource: DataSource,
  inventoryId: number,
  name: string,
  price: number,
) => {};

export const listInventoryItems = async (dataSource: DataSource) => {
  const result = await queries.getInventoryItems(dataSource);

  if (result.length === 0) {
    return `<div class="container"><small>No items currently in inventory. Click the add button to get started.</small></div>`;
  } else {
    return inventoryList(result);
  }
};

export const searchInventoryItems = async (
  dataSource: DataSource,
  name: string,
) => {
  const result = await queries.getInventoryItemsByName(dataSource, name);

  if (result.length === 0) {
    return `<div class="container"><small>No inventory items match search criteria '${name}'</small></div>`;
  } else {
    return inventoryList(result);
  }
};

export const listInventoryItemOrders = async (
  dataSource: DataSource,
  inventoryId: number,
) => {
  try {
    const getInventoryItemResult = await queries.getInventoryItemById(
      dataSource,
      inventoryId,
    );

    if (getInventoryItemResult === null) {
      const message = `Failed to find inventory item with id [${inventoryId}]`;
      console.error(message);
      throw new Error(message);
    }

    const ordersWithInventoryItem =
      await queries.getCompleteOrdersWithInventoryItems(dataSource, [
        getInventoryItemResult.id,
      ]);

    return ViewInventoryItemOrdersComponent(
      getInventoryItemResult,
      ordersWithInventoryItem,
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};
