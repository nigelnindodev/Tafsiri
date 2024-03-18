import { logger } from "..";
import { PostgresDataSourceSingleton } from "../postgres";
import {
    getOrderItemsInOrder,
    getOrderPrice,
    getOrders,
    insertOrderPrice,
} from "../postgres/queries";

/**
 * This one-off script is required in order to backfill any already created orders into the
 * order_item_price table.
 *
 * Uses the current inventory price of the item to set its amount.
 */

const dataSource = await PostgresDataSourceSingleton.getInstance();

const runOrderPriceBackFill = async () => {
    logger.trace("Start order price backfill");
    const orders = await getOrders(dataSource);

    logger.info("Number of completed orders:", orders.length);

    orders.forEach(async (order) => {
        const orderItems = await getOrderItemsInOrder(dataSource, order.id);
        logger.info("orderItems", orderItems);

        orderItems.forEach(async (orderItem) => {
            // Fetch order price first to ensure it doesn't exist yet
            const orderPrice = await getOrderPrice(dataSource, orderItem.id);
            logger.info("orderPrice", orderPrice);

            if (orderPrice === null) {
                logger.info("Inserting into order_item_price table", {
                    orderItemId: orderItem.id,
                    price: orderItem.inventory.price,
                });
                await insertOrderPrice(
                    dataSource,
                    orderItem.id,
                    orderItem.inventory.price
                );
            }
        });
    });
};

await runOrderPriceBackFill();
