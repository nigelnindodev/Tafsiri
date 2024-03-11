import { $ } from "bun";

// to stdout:
await $`ls *.ts`;

// to string:
const text = await $`ls *.ts`.text();

console.log(text);
