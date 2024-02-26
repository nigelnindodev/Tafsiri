import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Index } from "typeorm"
import { TableNames, OrderStatus, PaymentStatus, PaymentTypes } from "../common/constants"

const generateIndexName = (tableName: TableNames, columnName: string): string => {
  return `${tableName}_${columnName}_idx`;
};

@Entity({ name: TableNames.SCAFFOLD })
export class ScaffoldEntity {
  @PrimaryGeneratedColumn()
  id: number
}

/**
 * TODO: Does a many-to-ne column auto generate an index? Most likely not. Same applies to one-to-one
 * with on the joinColumn reletionship.
 */

/**
 * The inventory entity stores the types of items that can be sold.
 * Will have queries for:
 * - Adding a new item to the inventory.
 * - Updating an existing items price in the inventory.
 */
@Entity({ name: TableNames.INVENTORY })
export class InventoryEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Index(generateIndexName(TableNames.INVENTORY, "name"), { unique: true })
  @Column("varchar", { length: 100, nullable: false })
  name: string

  @Index(generateIndexName(TableNames.INVENTORY, "price"))
  @Column("decimal", { nullable: false })
  price: number

  @Index(generateIndexName(TableNames.INVENTORY, "active"))
  @Column("boolean", { nullable: false })
  active: boolean

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.inventory)
  order_items: OrderItemEntity[]

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date

  //TODO: Add updated at (skipped for now as we don't want to lose our inventory items in the DB)
}

/**
 * Contains details of a single order from a customer.
 * An order can have multiple items from the inventory of possible items.
 *
 * In the UI, the cashier interacts with a UI that allows them to specify multiple
 * order items, then the total order is automatically created.
 *
 * TODO: How do we handle changing of an order after it has been created?
 */
@Entity({ name: TableNames.ORDERS })
export class OrderEntity { // TODO: Rename to OrdersEntity
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => PaymentEntity, (payment) => payment.order_ref)
  payment: PaymentEntity

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.orders)
  order_items: OrderItemEntity[]

  @Column("enum", { enum: OrderStatus, nullable: false })
  status: OrderStatus

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date
}

/**
 * Workflow.
 * - Create order items.
 * - Based on order items and quantity, use data from the inventory table to calculate the total payment.
 * - Create a new payment from the above data
 * - Save the order items, payment and order.
 */
@Entity({ name: TableNames.ORDER_ITEM })
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column("boolean", { nullable: false })
  active: boolean

  @Column("int", { nullable: false })
  quantity: number

  @ManyToOne(() => InventoryEntity, (inventory) => inventory.order_items, { nullable: false })
  inventory: InventoryEntity

  @ManyToOne(() => OrderEntity, (order) => order.order_items, { nullable: false })
  orders: OrderEntity

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date
}

@Entity({ name: TableNames.PAYMENT })
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column("decimal", { nullable: false })
  amount: number

  // A reference that can be added for payment of the order, such as an Mpesa reference message
  @Column("varchar", { length: 100, nullable: true })
  reference: string

  @OneToOne(() => OrderEntity, (order) => order.payment, { nullable: false })
  @JoinColumn()
  order_ref: OrderEntity

  @Index(generateIndexName(TableNames.PAYMENT, "payment_status"))
  @Column("enum", { enum: PaymentStatus, nullable: false })
  payment_status: PaymentStatus

  @Index(generateIndexName(TableNames.PAYMENT, "payment_type"))
  @Column("enum", { enum: PaymentTypes, nullable: false })
  payment_type: PaymentTypes

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date
}

@Entity({ name: TableNames.USERS })
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => UserCredentialsEntity, (userCredentials) => userCredentials.user_ref)
  user_credentials: UserCredentialsEntity

  @Index(generateIndexName(TableNames.USERS, "username"), { unique: true })
  @Column("varchar", { length: 100, nullable: false })
  username: string

  @Index(generateIndexName(TableNames.USERS, "is_active"))
  @Column("boolean", { nullable: false, default: true })
  is_active: boolean

  @Index(generateIndexName(TableNames.USERS, "is_admin"))
  @Column("boolean", { nullable: false })
  is_admin: boolean

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date
}

@Entity({ name: TableNames.USER_CREDENTIALS })
export class UserCredentialsEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => UsersEntity, (users) => users.user_credentials, { nullable: false })
  @JoinColumn()
  user_ref: UsersEntity

  @Column("varchar")
  encrypted_password: string

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: Date
}
