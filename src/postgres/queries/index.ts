import { DataSource, InsertResult, UpdateResult } from "typeorm"
import { InventoryEntity, OrderEntity, OrderItemEntity, PaymentEntity } from "../entities";
import { OrderStatus, PaymentStatus, PaymentTypes, TableNames } from "../common/constants";

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
 * Query is used to populate the dropdown of inventory items in the create order section of
 * the UI.
 *
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

export const completeOrder = async (
  dataSource: DataSource,
  orderId: number
): Promise<UpdateResult> => {
  return await dataSource.createQueryBuilder()
    .update(OrderEntity)
    .set({ status: OrderStatus.COMPLETED })
    .where("orders.id = :id", { id: orderId })
    .execute();
};

export const getOrderById = async (
  dataSource: DataSource,
  id: number
): Promise<OrderEntity | null> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.ORDERS)
    .from(OrderEntity, TableNames.ORDERS)
    .where("orders.id = :id", { id: id })
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
  return await dataSource.getRepository(OrderItemEntity).createQueryBuilder(TableNames.ORDER_ITEM)
    .innerJoinAndSelect("order_item.inventory", TableNames.INVENTORY)
    .where("order_item.ordersId = :orderId", { orderId })
    .orderBy({ "order_item.id": "DESC" })
    .getMany();
}

/**
 * Fetches latest unfinished orders togerther with its order items, limiting to the last 10 items. 
 */
export const getUnfinishedOrderItems = async (
  dataSource: DataSource
): Promise<OrderEntity[]> => {
  return await dataSource.getRepository(OrderEntity)
    .createQueryBuilder(TableNames.ORDERS)
    .innerJoinAndSelect("orders.orderItems", TableNames.ORDER_ITEM)
    .where("orders.status != :orderStatus", { orderStatus: OrderStatus.COMPLETED })
    .orderBy({ "orders.id": "DESC" })
    .limit(10)
    .getMany();
};

/**
 * Get order item using its auto incrementing id.
 * Careful with this method, as corresponding relations will be null.
 */
export const getOrderItemById = async (
  dataSource: DataSource,
  itemId: number
): Promise<OrderItemEntity | null> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.ORDER_ITEM)
    .from(OrderItemEntity, TableNames.ORDER_ITEM)
    .where("order_item.id = :id", { id: itemId })
    .getOne();
};

/**
 * Fetches an inventory item for a specific order.
 * TODO: Method name may be misleading as it shows inventory details are also sent.
 */
export const getOrderItemWithInventoryDetails = async (
  dataSource: DataSource,
  orderId: number,
  inventoryId: number
): Promise<OrderItemEntity | null> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.ORDER_ITEM)
    .from(OrderItemEntity, TableNames.ORDER_ITEM)
    .where("order_item.ordersId = :orderId", { orderId: orderId })
    .andWhere("order_item.inventoryId = :inventoryId", { inventoryId: inventoryId })
    .getOne();
};

/**
 * Toggles active state of an order item.
 */
export const toggleOrderItem = async (
  dataSource: DataSource,
  itemId: number,
  active: boolean
): Promise<UpdateResult> => {
  return await dataSource.createQueryBuilder()
    .update(OrderItemEntity)
    .set({
      active: active
    })
    .where("order_item.id = :id", { id: itemId })
    .execute();
}

export const updateOrderItemCount = async (
  dataSource: DataSource,
  itemId: number,
  quantity: number
): Promise<UpdateResult> => {
  return await dataSource.createQueryBuilder()
    .update(OrderItemEntity)
    .set({
      quantity: quantity
    })
    .where("order_item.id = :id", { id: itemId })
    .execute();
};

/**
 * Adds a new inventory item to an order.
 * Query is initialized in the UI by selecting the inventory item from the list
 * during order creation.
 * Initialized the quantity to 1, and also makes the inventory item active.
 */
export const insertOrderitem = async (
  dataSource: DataSource,
  orderId: number,
  inventoryId: number
): Promise<InsertResult> => {
  console.log(`orderId = ${orderId} | inventoryId: ${inventoryId}`);
  try {
    return await dataSource.createQueryBuilder()
      .insert()
      .into(TableNames.ORDER_ITEM)
      .values({
        orders: orderId,
        inventory: inventoryId,
        quantity: 1,
        active: true
      })
      .execute();
  } catch (e) {
    console.error(e);
    throw (e);
  }
};

export const initializePayment = async (
  dataSource: DataSource,
  orderId: number
): Promise<InsertResult> => {
  return await dataSource.createQueryBuilder()
    .insert()
    .into(TableNames.PAYMENT)
    .values({
      amount: 0,
      orderRef: orderId,
      paymentType: PaymentTypes.CASH, // initialize payemnts with cash
      paymentStatus: PaymentStatus.INITIALIZED
    }).execute();
};

export const getPaymentById = async (
  dataSource: DataSource,
  id: number
): Promise<PaymentEntity | null> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.PAYMENT)
    .from(PaymentEntity, TableNames.PAYMENT)
    .where("payment.id = id", { id: id })
    .getOne();
};

export const completePayment = async (
  dataSource: DataSource,
  paymentId: number,
  amount: number
): Promise<UpdateResult> => {
  return await dataSource.createQueryBuilder()
    .update(PaymentEntity)
    .set({
      amount: amount,
      paymentStatus: PaymentStatus.COMPLETED
    }).where("payment.id = :id", { id: paymentId })
    .execute();
};

export const getPaymentByOrderId = async (
  dataSource: DataSource,
  orderId: number
): Promise<PaymentEntity | null> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.PAYMENT)
    .from(PaymentEntity, TableNames.PAYMENT)
    .where("payment.orderRefId = :orderId", { orderId: orderId })
    .getOne();
}

export const updatePaymentType = async (
  dataSource: DataSource,
  id: number,
  paymentType: PaymentTypes
): Promise<UpdateResult> => {
  return await dataSource.createQueryBuilder()
    .update(PaymentEntity)
    .set({ paymentType: paymentType })
    .where("payment.id = id", { id: id })
    .execute();
};
