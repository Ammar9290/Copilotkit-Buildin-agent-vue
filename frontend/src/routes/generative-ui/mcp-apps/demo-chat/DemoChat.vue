<script setup lang="ts">
/**
 * MCP Apps: the runtime wires the MCP server (backend/server.ts, enabled by
 * MCP_APPS_SERVER_URL and scoped to agent `mcp-apps`). The doc says no
 * frontend renderer is needed, so this is just a CopilotChat.
 *
 * Deviation: the doc's chat uses the default agent. The server is scoped to
 * `mcp-apps` so its tools do not leak into other pages, hence the agent-id.
 */
import { CopilotChat } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
</script>

<template>
  <DemoFrame parent-path="/generative-ui/mcp-apps" subtitle="runtime mcpApps · agent mcp-apps">
    <main class="h-full"><CopilotChat agent-id="mcp-apps" /></main>
  </DemoFrame>
</template>
