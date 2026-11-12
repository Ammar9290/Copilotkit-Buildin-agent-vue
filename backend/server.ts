/**
 * Copilot Runtime for the CopilotKit + Vue test suite.
 *
 * Shape follows the Vue quickstart (https://docs.copilotkit.ai/vue): a plain
 * Node `http` server hosting Copilot Runtime at /api/copilotkit with CORS on,
 * because Vite (5173) and the runtime (8200) run on different origins.
 *
 * Every agent id the frontend uses is registered here. Agent ids match the
 * ones used in the Vue doc code samples (`my-agent`, `sales`, `workspace`,
 * `support`, ...) so the frontend demos can stay close to the docs.
 */
import { config as loadEnv } from "dotenv";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

// backend/.env first, then the repo-root .env (see .env.example). dotenv never
// overrides a variable that is already set, so backend/.env wins on conflicts.
loadEnv({ path: fileURLToPath(new URL("./.env", import.meta.url)), quiet: true });
loadEnv({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });
import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";
import { buildAgents } from "./agents/index.js";

const port = Number(process.env.PORT ?? 8200);
const basePath = "/api/copilotkit";
const mcpAppsUrl = process.env.MCP_APPS_SERVER_URL?.trim();

const runtime = new CopilotRuntime({
  agents: buildAgents(),
  // Troubleshooting → Debug Mode: structured AG-UI pipeline logs.
  // COPILOT_DEBUG=true | verbose (verbose includes full event payloads / PII).
  ...(process.env.COPILOT_DEBUG
    ? { debug: process.env.COPILOT_DEBUG === "verbose" ? { verbose: true } : true }
    : {}),
  // AgentRunner and persistence page: explicit in-memory runner with the
  // bounded-history options from the docs (also the default when omitted).
  runner: new InMemoryAgentRunner({
    maxThreads: 200,
    maxRunsPerThread: 50,
    maxBytes: 128 * 1024 ** 2,
  }),
  // MCP Apps page: only enabled when a server URL is configured. Scoped to
  // the `mcp-apps` agent so MCP tools do not leak into every other page.
  ...(mcpAppsUrl
    ? {
        mcpApps: {
          servers: [
            {
              type: "http" as const,
              url: mcpAppsUrl,
              serverId: "test-suite-mcp-app",
              agentId: "mcp-apps",
            },
          ],
        },
      }
    : {}),
});

createServer(
  createCopilotNodeListener({
    runtime,
    basePath,
    cors: true,
  }),
).listen(port, () => {
  console.log(`Copilot Runtime listening at http://localhost:${port}${basePath}`);
  console.log(`  model:      ${process.env.COPILOT_MODEL ?? "openai:gpt-6-luna"}`);
  console.log(`  MCP Apps:   ${mcpAppsUrl ?? "(disabled — set MCP_APPS_SERVER_URL)"}`);
  for (const key of ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_API_KEY"]) {
    console.log(`  ${key.padEnd(18)}${process.env[key] ? "set" : "not set"}`);
  }
});
