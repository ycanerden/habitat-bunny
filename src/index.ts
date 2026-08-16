#!/usr/bin/env node
// Habitat bunny: local MCP server over stdio.
// Usage: npx habitat-bunny  (state is kept in ./.habitat of the working directory)

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const server = createServer(process.cwd());
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout belongs to the MCP protocol; log to stderr only.
  console.error("habitat-bunny is listening. One hop at a time.");
}

main().catch((error: unknown) => {
  console.error("habitat-bunny failed to start:", error);
  process.exit(1);
});
