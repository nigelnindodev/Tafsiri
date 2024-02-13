export enum TableNames {
  SCAFFOLD = "scaffold",
  INVENTORY = "inventory",
  ORDERS = "orders",
  ORDER_ITEM = "order_item",
  PAYMENT = "payment",
  PAYMENT_TYPE = "payment_type"
};

export enum PaymentTypes {
  CASH = "CASH",
  MPESA = "MPESA"
};

export enum OrderStatus {
  INITIALIZED = "INITIALIZED",
  FINALIZED = "FINALIZED:", // After order items have been added
  PAYMENT_IN_PROGRESS = "PAYMENT_IN_PROGRESS", // After some (partial) payments have been made on the order
  COMPLETED = "COMPLETED", // After an order has been fully paid
}
