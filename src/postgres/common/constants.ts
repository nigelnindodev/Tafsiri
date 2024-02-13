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
  INITIALIZED = "INITIALIZED", // Goes into this state on creation of an order
  FINALIZED = "FINALIZED:", // After order items have been added and confirmed
  COMPLETED = "COMPLETED", // After an order has been fully paid
}

export enum PaymentStatus {
  INITIALIZED = "INITIALIZED", // Goes into this state on creation of an order
  PAYMENT_PENDING = "PAYMENT_PENDING", // Not currently in use, but may be in the future for defer payments
  PARTIAL_PAYMENT = "PARTIAL_PAYMENT", // Also not in use at the moment, but for orders with partial payments
  COMPLETED = "COMPLETED" // Full payment made
}
