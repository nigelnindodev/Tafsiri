import { $ } from "bun";

// Use docker compose to set up a postgres database as specified in compose.yaml
await $`docker compose up -d`;

// Run tests
await $`bun run test`;

// Destroy the postgres instance and ensure any created volumes are removed as well
await $`docker compose down --volumes`;
