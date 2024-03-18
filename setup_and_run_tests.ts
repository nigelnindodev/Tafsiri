import { $ } from "bun";
import { setTimeout } from "timers/promises";

//purge any docker volumes that may exists i.e due to failed tests
await $`docker compose down --volumes`;

// Use docker compose to set up a postgres database as specified in compose.yaml
await $`docker compose up -d`;

// We might be running tests much faster than when our postgres container is ready to handle
// them. Set up a 10 second delay before starting testing.
await setTimeout(10000);

// Run tests
const testResult = await $`bun run test`;
if (testResult.exitCode !== 0) {
    console.error(
        "An error occured while running bun tests",
        testResult.stderr.toString()
    );
    throw new Error(testResult.stderr.toString());
}

// Destroy the postgres instance and ensure any created volumes are removed as well
await $`docker compose down --volumes`;
