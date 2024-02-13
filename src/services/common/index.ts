import { OrderItemEntity } from "../../postgres/entities";

/**
 * Ensure when calling this funtion, the query for fetching order item entities should
 * also join with the inventory table, else will lead to undefined errors.
 *
 * TODO: Maybe come up with a way to type with requirement?
 */
export const getTotalOrderCost = (orderItems: OrderItemEntity[]): number => {
	if (orderItems.length === 0) {
		return 0;
	} else {
		let totalCost = 0;
		orderItems.forEach(item => {
			totalCost += item.quantity * item.inventory.price;
		});
		return totalCost;
		// above an be simplified with reduce
	}
}
