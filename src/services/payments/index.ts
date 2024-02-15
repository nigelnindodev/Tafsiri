import { DataSource } from "typeorm";
import { PaymentsListComponent } from "../../components/pages/payments/payments_list";
import { getCompletedOrders } from "../../postgres/queries";

export const listPayments = async (dataSource: DataSource) => {
	const completedOrders = await getCompletedOrders(dataSource);
	return PaymentsListComponent(completedOrders);
};
