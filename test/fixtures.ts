import Elysia, { Cookie } from "elysia";
import { getTestBaseUrl } from "./test_utils";
const Chance = require("chance");
const chance = new Chance();

export interface TestInventoryItem {
    name: string;
    price: number;
}

export interface TestOrder {}

export interface TestOrderItem {}

export interface TestPayment {}

/**
 * Generate random inventory items.
 *
 * Not really up to the definition of a fixture, but the item
 * and price are known types.
 *
 * `chance.name` Gives the best shape of inventory item names we
 * will be expecting, although inventory items will not be
 * people's names. Important to make that clear.
 */
export const generateInventoryItems = (
    numItems: number
): TestInventoryItem[] => {
    let items: TestInventoryItem[] = [];
    for (let i = 0; i < numItems; i++) {
        items.push({
            name: chance.name({ middle_initial: true }),
            price: chance.integer({ min: 10, max: 5000 }),
        });
    }
    return items;
};

/**
 * Sends API requests to create each inventory item.
 */
export const createInventoryItems = async (
    app: Elysia,
    inventoryItems: TestInventoryItem[],
    authCookierHeader: string
): Promise<void> => {
    const results = inventoryItems.map((inventoryItem) => {
        return app.handle(
            new Request(`${getTestBaseUrl(app)}/inventory/create`, {
                method: "POST",
                headers: {
                    Cookie: authCookierHeader,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inventoryItem),
            })
        );
    });
    await Promise.all(results);
};

export const createUnfinisheOrder = async (
    app: Elysia,
    authCookieHeader: string
): Promise<void> => {
    await app.handle(
        new Request(`${getTestBaseUrl(app)}/orders/create`, {
            headers: {
                Cookie: authCookieHeader,
            },
        })
    );
};
