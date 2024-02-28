import { DataSource, InsertResult, UpdateResult } from "typeorm"
import { InventoryEntity, OrdersEntity, OrderItemEntity, PaymentEntity, UsersEntity } from "../entities";
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
  const data: InventoryEntity[] = await dataSource.createQueryBuilder()
    .select(TableNames.INVENTORY)
    .from(InventoryEntity, TableNames.INVENTORY)
    .where("active = :state", { state: true })
    .orderBy({ "inventory.id": "ASC" })
    .getMany();
  return data;
};

export const getInventoryItemById = async (
  dataSource: DataSource,
  inventoryId: number
): Promise<InventoryEntity | null> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.INVENTORY)
    .from(InventoryEntity, TableNames.INVENTORY)
    .where("id = :id", { id: inventoryId })
    .getOne();
};

/**
 * Query is used to populate the drop-down of inventory items in the create order section of
 * the UI.
 *
 * We could refactor order by as a parameter, but not doing that as of now, still not sure
 * if we will be too common of a pattern.
 */
export const getInventoryItemsOrderByName = async (
  dataSource: DataSource
): Promise<InventoryEntity[]> => {
  //TODO: String interpolation on a JS object key
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
 * Would also prefer to use Postgres' similarity function instead of a LIKE query here
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
    .update(OrdersEntity)
    .set({
      status: OrderStatus.COMPLETED,
      updated_at: new Date()
    })
    .where("orders.id = :id", { id: orderId })
    .execute();
};

export const getOrderById = async (
  dataSource: DataSource,
  id: number
): Promise<OrdersEntity | null> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.ORDERS)
    .from(OrdersEntity, TableNames.ORDERS)
    .where("orders.id = :id", { id: id })
    .getOne();
};

/**
 * TODO: Might we need some limit on this. Definitely in the future we'll also require offsets
 * for pagination
 */
export const getOrders = async (
  dataSource: DataSource
): Promise<OrdersEntity[]> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.ORDERS)
    .from(OrdersEntity, TableNames.ORDERS)
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
 * Should be ordered by the order id DESC so that the latest unfinisehd order is at the top.
 */
export const getUnfinishedOrderItems = async (
  dataSource: DataSource
): Promise<OrdersEntity[]> => {
  return await dataSource.getRepository(OrdersEntity)
    .createQueryBuilder(TableNames.ORDERS)
    .innerJoinAndSelect("orders.order_items", TableNames.ORDER_ITEM)
    .innerJoinAndSelect("order_item.inventory", TableNames.INVENTORY)
    .where("orders.status != :orderStatus", { orderStatus: OrderStatus.COMPLETED })
    .orderBy({ "orders.id": "DESC" })
    //.limit(10)
    .getMany();
};

/**
 * Fetches all completed orders with all its details (Order Items, Inventory Details, Payment Details)
 */
export const getCompletedOrders = async (
  dataSource: DataSource
): Promise<OrdersEntity[]> => {
  return await dataSource.getRepository(OrdersEntity)
    .createQueryBuilder(TableNames.ORDERS)
    .innerJoinAndSelect("orders.order_items", TableNames.ORDER_ITEM)
    .innerJoinAndSelect("order_item.inventory", TableNames.INVENTORY)
    .innerJoinAndSelect("orders.payment", TableNames.PAYMENT)
    .where("orders.status = :orderStatus", { orderStatus: OrderStatus.COMPLETED })
    .orderBy({ "payment.updated_at": "DESC" }) // TODO: maybe change order criteria i.e when payment was completed?
    //.limit(50)
    .getMany();
}

/**
 * Fetches completed orders containing inventory items within the specified ids.
 *
 * Currently used to only fetch one inventory item, but using a select in for future proofing
 * in case we'll need to fetch for multiple inventory items.
 */
export const getCompleteOrdersWithInventoryItems = async (
  dataSource: DataSource,
  inventoryIds: number[]
): Promise<OrdersEntity[]> => {
  return await dataSource.getRepository(OrdersEntity)
    .createQueryBuilder(TableNames.ORDERS)
    .innerJoinAndSelect("orders.order_items", TableNames.ORDER_ITEM)
    .innerJoinAndSelect("order_item.inventory", TableNames.INVENTORY)
    .innerJoinAndSelect("orders.payment", TableNames.PAYMENT)
    .where("orders.status = :orderStatus", { orderStatus: OrderStatus.COMPLETED })
    .andWhere("inventory.id IN(:...ids)", { ids: inventoryIds })
    .orderBy({ "payment.updated_at": "DESC" }) // TODO: maybe change order criteria i.e when payment was completed?
    //.limit(50)
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
 * Fetches an inventory item for a specific order given its inventoryId.
 */
export const getOrderItemByInventoryId = async (
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
      order_ref: orderId,
      payment_type: PaymentTypes.CASH, // initialize payemnts with cash
      payment_status: PaymentStatus.INITIALIZED
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
      payment_status: PaymentStatus.COMPLETED,
      updated_at: new Date()
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
  paymentId: number,
  paymentType: PaymentTypes
): Promise<UpdateResult> => {
  return await dataSource.createQueryBuilder()
    .update(PaymentEntity)
    .set({ payment_type: paymentType })
    .where("payment.id = :id", { id: paymentId })
    .execute();
};

/**
 * Fetches a user using their database id. Does not return encrypted user credentials.
 */
export const getUserById = async (
  dataSource: DataSource,
  userId: number
): Promise<UsersEntity | null> => {
  return await dataSource.createQueryBuilder()
    .select(TableNames.USERS)
    .from(UsersEntity, TableNames.USERS)
    .where("users.id = :id", { id: userId })
    .getOne();
};

/**
 * Fetches user detials by using their username. returns the user's encrypted credentials. Useful
 * for loggin in users.
 */
export const getUserByUsernameWithCredentials = async (
  dataSource: DataSource,
  username: string
): Promise<UsersEntity | null> => {
  return await dataSource.getRepository(UsersEntity)
    .createQueryBuilder(TableNames.USERS)
    .innerJoinAndSelect("users.user_credentials", TableNames.USER_CREDENTIALS)
    .where("users.username = :username", { username: username })
    .getOne();
}

/**
 * Creates a new user. By defualt, all users are non-admin.
 */
export const createNewUser = async (
  dataSource: DataSource,
  username: string
): Promise<InsertResult> => {
  return await dataSource.createQueryBuilder()
    .insert()
    .into(UsersEntity)
    .values({
      username: username,
      is_admin: false,
      is_active: true
    })
    .execute();
};

export const createUserCredentials = async (
  dataSource: DataSource,
  userId: number,
  encryptedPassword: string
): Promise<InsertResult> => {
  return await dataSource.createQueryBuilder()
    .insert()
    .into(TableNames.USER_CREDENTIALS)
    .values({
      user_ref: userId,
      encrypted_password: encryptedPassword
    })
    .execute();
};
