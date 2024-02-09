import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { TableNames, PaymentTypes } from "../common/constants"

@Entity({ name: TableNames.SCAFFOLD })
export class ScaffoldEntity {
  @PrimaryGeneratedColumn()
  id: number
}

/**
 * The inventory entity stores the types of items that can be sold.
 * Will have queries for:
 * - Adding a new item to the inventory.
 * - Updatig an existing items price in the inventory.
 */
@Entity({ name: TableNames.INVENTORY })
export class InventoryEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column("varchar", { length: 100, nullable: false })
  name: string

  @Column("decimal", { nullable: false })
  price: number

  @Column("boolean", { nullable: false })
  active: boolean

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.invetory)
  orderItems: OrderItemEntity[]

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date
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
@Entity({ name: TableNames.ORDER })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => PaymentEntity, (payment) => payment.order)
  payment: PaymentEntity

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
  orderItems: OrderItemEntity[]

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date
}

/**
 * Workflow.
 * - Create order items.
 * - Bassed on order items and quantity, use data from the inventory table to calculate the total payment.
 * - Create a new payment from the above data
 * - Save the order items, payment and order.
 */
@Entity({ name: TableNames.ORDER_ITEM })
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column("int", { nullable: false })
  quantity: number

  @ManyToOne(() => InventoryEntity, (inventory) => inventory.orderItems)
  invetory: InventoryEntity

  @ManyToOne(() => OrderEntity, (order) => order.orderItems)
  order: OrderEntity

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

  @OneToOne(() => OrderEntity, (order) => order.payment)
  @JoinColumn()
  order: OrderEntity

  @ManyToOne(() => PaymentTypeEntity, (paymentType) => paymentType.payments)
  paymentType: PaymentTypeEntity

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date
}

/**
 * Possible payment methods that can be used to pay an order.
 * Current possible values are cash and M-Pesa.
 */
@Entity({ name: TableNames.PAYMENT_TYPE })
export class PaymentTypeEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column("enum", { enum: PaymentTypes, nullable: false })
  type: PaymentTypes

  @OneToMany(() => PaymentEntity, (payment) => payment.paymentType)
  payments: PaymentEntity[]

  @Column("timestamptz", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
  created_at: Date
}
