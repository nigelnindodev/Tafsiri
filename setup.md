# Intro

This is a refine dashboard that allows for managing of inventory, storing orders and a custom invoice system.

# Pages

This is composed of the following sections:

## Dashboard

Allows for a quick glance at price statistic for the day.

TODO: Create which specific dashboard items are the most important to be used.

## Inventory

Allows for viewing, adding and editing inventory items. Inventory items includes the:

-   Id
-   Name
-   Description
-   Price
-   Created/Updated At

In the portal, commonly used items should be at the top for better UX.

## Orders

Allows for creation of orders. This compromises of:

-   Order id
-   Reference (Some payment reference if available, such as M-Pesa. Allows for easy searching of an order from M-Pesa messages)
-   Staff Id (References the staffer who created the order)
-   Created At. No Updated at.

Based of the price and quantities of the order items, the total price of an order is automatically calculated.

## Order Items

An order can have more than one item, this allows for creation of that.

-   Order Id
-   Inventory Id
-   Quantity (An integer showing how many values of the item was bought)
-   Created At

## Invalid Orders

Section for making an order invalid. This could be due to some reasons.

-   Order Id.
-   Reason (Maybe provide a list of enum values with normal reasons as to why the order was invalid?)
-   Created At
-   Updated At

## Payment Types

Most likely will now just be cash and M-Pesa

## Staff

This is a section where staff details are kept.

-   Name
-   Created At
-   Active (Only active staff should be able to create orders)

This might be extended in the future to include which areas of the portal that the staff can access.

## Invoices

Auto created during order creation. Allows for easy tracking of an invoice.

-   Order Id

## Invoice Payments

Records payments towards a specific invoice. Allows for partial payments so that an invoice can be completed over a period of time.
