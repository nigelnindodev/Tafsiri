# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## TODO
- [] Timezone awareness
- [] State machines for model statuses
- [] Proper handling of amounts with decimals
- [] Add Zod for handling validations
- [] Add DB indexes
- [] Ensure once order item added to an order, it's price is immutable
- [] API tests
- [] Instead of repeating try/catch error handling for each service method, refactor the try catch to wrap all controller methods. TODO: Does this this also propagate to the service methods? This will be interesting to find out!
- [] For HTMX sections where we replace all content(hx-target="outerHTML"), would be a good practice to place these sections in constants sine they are referenced in multiple locations. Should we then choose to rename them, we'll then just need to change once reference (DRY)
- [] Use snake_case for all DB columns
- [] Remove long polling in creation of an order
- [] Fix bug with updated at not correctly propagating on DB level (a workaround is currently being used)

Upcoming features
- [] Add staff details to an order to know who completed an order
- [] Allow for changes to a confirmed order
- [] Edit log of all changes to an order, and who made the change
- [] Restriction of sensitive sections of the service to admin users only i.e Inventory Section (which can change pricing of items)
- [] Full actions log (i.e who accessed the orders section, who viewed an order details and what time)
- [] Authentication (username & password) to prevent unauthorized access
- [] Ability to filter for payments according to date and time interval
- [] Pagination of data (currently fetching all rows from the DB, this isn't feasible for a real world project)
- [] Add partial and deferred payments, together with tracking of the same
- [] Maybe to be added, but also tracking of how many inventory items are coming in. This together with order tracking can automate knowing how many inventory items are left in stock
- [] Mobile App?
