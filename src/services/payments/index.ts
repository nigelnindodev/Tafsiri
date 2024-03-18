import { DataSource } from "typeorm";
import { PaymentsListComponent } from "../../components/pages/payments/payments_list";
import { getCompletedOrders } from "../../postgres/queries";
import { logger } from "../..";

export const listPayments = async (dataSource: DataSource) => {
    const completedOrders = await getCompletedOrders(dataSource);
    logger.trace("completedOrders", completedOrders);
    return PaymentsListComponent(completedOrders);
};
