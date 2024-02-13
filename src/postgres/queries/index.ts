import { DataSource, InsertResult, InsertResult } from "typeorm"
import { InventoryEntity, OrderEntity, OrderItemEntity } from "../entities";
import { OrderStatus, TableNames } from "../common/constants";

export const insertInventoryItem = async (
  dataSource: DataSource,
  data: {
    name: string;
    price: number;
  }
): Promise<InsertResult> => {
  return await dataSource.createQueryBuilder()
    .insert()
    .into(InventoryEntity)
    .values({
      name: data.name.toUpperCase(),
      price: data.price,
      active: true // one creation an inventory item is automatically active
    })
    .execute();
};

export const getInventoryItems = async (
  dataSource: DataSource
): Promise<InventoryEntity[]> => {
  //TODO: String interpolation on a JS object key
  //const orderColumn: string = `${TableNames.INVENTORY}.id`;
  const data: InventoryEntity[] = await dataSource.createQueryBuilder()
    .select(TableNames.INVENTORY)
    .from(InventoryEntity, TableNames.INVENTORY)
    .where("active = :state", { state: true })
    .orderBy({ "inventory.id": "ASC" })
    .getMany();
  return data;
};

/**
 * We could refactor order by as a parameter, but not doing that as of now, still not sure
 * if we will be too common of a pattern.
 */
export const getInventoryItemsOrderByName = async (
  dataSource: DataSource
): Promise<InventoryEntity[]> => {
  //TODO: String interpolation on a JS object key
  //const orderColumn: string = `${TableNames.INVENTORY}.id`;
  const data: InventoryEntity[] = await dataSource.createQueryBuilder()
    .select(TableNames.INVENTORY)
    .from(InventoryEntity, TableNames.INVENTORY)
    .where("active = :state", { state: true })
    .orderBy({ "inventory.name": "ASC" })
    .getMany();
  return data;
};

/**
 * Possibility of SQL injection here in the like part of the query?
 * WOuld also prefer to use Postgres' similarity function instead of a LIKE query here
 */
export const getInventoryItemsByName = async (
  dataSource: DataSource,
  name: string)
  : Promise<InventoryEntity[]> => {
  try {
    const data: InventoryEntity[] = await dataSource.createQueryBuilder()
      .select(TableNames.INVENTORY)
      .from(InventoryEntity, TableNames.INVENTORY)
      //.where("similarity(name, :name) > 0.2", {name: name.toUpperCase()})
      .where(`name like '%${name.toUpperCase()}%'`)
      .andWhere("active = :state", { state: true })
      .orderBy({ "inventory.id": "ASC" })
      .getMany()
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }

};

export const initializeOrder = async (
  dataSource: DataSource
): Promise<InsertResult> => {
  return await dataSource.createQueryBuilder()
    .insert()
    .into(TableNames.ORDERS)
    .values({
      status: OrderStatus.INITIALIZED
    })
    .execute();
};

export const getOrderById = async (
  dataSource: DataSource,
  id: number
): Promise<OrderEntity> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.ORDERS)
    .where("id = :id", { id: id })
    .getOne();
};

export const getOrders = async (
  dataSource: DataSource
): Promise<OrderEntity[]> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.ORDERS)
    .from(OrderEntity, TableNames.ORDERS)
    .orderBy({ "orders.id": "DESC" }).
    getMany();
};

/**
 * Fetches all the inventory items in a particular order.
 */
export const getOrderItemsInOrder = async (
  dataSource: DataSource,
  orderId: number
): Promise<OrderItemEntity[]> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.ORDER_ITEM)
    .from(OrderItemEntity, TableNames.ORDER_ITEM)
    .where("order_item.orderId = :orderId", { orderId })
    .getMany();
}

export const insertOrderitem = async (
  dataSource: DataSource,
  orderId: number,
  inventoryId: number
): Promise<InsertResult> => {
  return await dataSource.createQueryBuilder()
    .insert()
    .into(TableNames.ORDER_ITEM)
    .values({
      orderId: orderId,
      inventoryId: inventoryId,
      quantity: 1, // initialize all inventory items in an order with a qantity of one
    })
    .execute();
};
