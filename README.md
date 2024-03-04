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
- [X] Remove long polling in creation of an order
- [X] Instead of repeating try/catch error handling for each service method, refactor the try catch to wrap all controller methods. TODO: Does this this also propagate to the service methods? This will be interesting to find out!
- [X] Add Zod for handling API validations
- [X] Use snake_case for all DB columns (Untested across the board, unit tests would have been nice right now :-))
- [ ] Return BAD REQUEST on failed Zod validations
- [X] Add DB indexes
- [X] Improve logging with ts-log and create standard semantics for logs
- [X] For HTMX sections where we replace all content(hx-target="outerHTML"), would be a good practice to place these sections in constants sine they are referenced in multiple locations. Should we then choose to rename them, we'll then just need to change once reference (DRY)
- [ ] Ensure once order item added to an order, it's price is immutable
- [ ] API tests
- [ ] HTMX input white listing (Maybe important to avoid XSS attacks)
- [ ] Timezone awareness
- [ ] Proper handling of amounts with decimals
- [X] Fix bug with updated at not correctly propagating on DB level (a workaround is currently being used). Was not working because updated_at on date functionality is only supported on Postgres for TypeORM. So the workaround is the solution.
- [X] Remove hardcoding of base url

## Upcoming features
- [X] Authentication (username & password) to prevent unauthorized access
- [ ] Add staff details to an order to know who completed an order. Staff can log in with their dedicated credentials.
- [X] Restriction of sensitive sections of the service to admin users only i.e Inventory Section (which can change pricing of items)
- [ ] Full actions log (i.e who accessed the orders section, who viewed an order details and what time)
- [ ] Edit log of all changes to an order, and who made the change (Can be combined with actions log)
- [ ] Ability to filter for payments according to date and time interval
- [ ] Manual reconciliation via CSV and/or Excel/Google Sheets

## Would be nice
- [ ] IP Address white listing (help for example ensure the service can only be accessed when connected to the store's WiFi)
- [ ] End to end tests with Puppeteer
- [ ] MetaBase for more in depth BI analysis
- [ ] Automated daily backups of all transactions to CSV files (stored on S3 buckets)
- [ ] Allow for changes to a confirmed order
- [ ] Pagination of data (currently fetching all rows from the DB, this isn't feasible for a real world project)
- [ ] Add partial and deferred payments, together with tracking of the same
- [ ] Maybe to be added, but also tracking of how many inventory items are coming in. This together with order tracking can automate knowing how many inventory items are left in stock
- [ ] Mobile App?

## Remove Packages
- [X] tailwindcss
- [X] postcss
- [X] @gtramontina.com/elysia-tailwind 
