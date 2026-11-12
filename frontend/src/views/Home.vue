<script setup lang="ts">
import { onMounted, ref } from "vue";
import RouteHeader from "@/components/RouteHeader.vue";
import Panel from "@/components/ui/Panel.vue";
import TryIt from "@/components/ui/TryIt.vue";
import KeyValue from "@/components/ui/KeyValue.vue";
import Callout from "@/components/ui/Callout.vue";
import { RUNTIME_URL, PUBLIC_LICENSE_KEY } from "@/config";
import { DOCS_ROOT } from "@/lib/nav-config";

const info = ref<{ version?: string; agents?: Record<string, unknown> } | null>(null);
const infoError = ref("");
onMounted(async () => {
  try {
    info.value = await (await fetch(`${RUNTIME_URL}/info`)).json();
  } catch (e) {
    infoError.value = (e as Error).message;
  }
});

const AGENTS: [string, string, string][] = [
  ["default", "quickstart prompt · mock tools · interrupting execute_governed_action", "Quickstart, Tool Rendering, Component as tool, Frontend Tools, Render state, Read-only context, HITL, Governed actions, Inspector"],
  ["my-agent", "get_weather", "Prebuilt components, Slots, Headless UI, Headless threads, Thread lifecycle"],
  ["sales", "get_sales_data", "Programmatic Control"],
  ["workspace", "AG-UI state tools", "Shared State"],
  ["support", "model only", "Threads Drawer"],
  ["mcp-apps", "MCP Apps server (opt-in)", "MCP Apps"],
  ["subagents", "research / writing / critique tools", "SubAgents"],
  ['router-aisdk', 'factory: type "aisdk" · streamText', "Use any model router"],
  ['router-custom', 'factory: type "custom" · scripted, no key', "Model router, AG-UI, Runtime endpoints, AgentRunner, Copilot Runtime"],
];
</script>

<template>
  <RouteHeader path="/" />

  <Panel title="What this is">
    <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      A working test harness for CopilotKit's <strong>Vue</strong> frontend, <code>@copilotkit/vue</code>, against a local
      Copilot Runtime running CopilotKit's <code>BuiltInAgent</code>. Each route implements one Vue doc page and shows the
      exact source that makes it work; its <em>Open demo</em> button opens a chrome-free page meant to be recorded.
    </p>
    <div class="mt-4">
      <KeyValue
        :rows="[
          ['Docs tracked', `${DOCS_ROOT}/vue`, `${DOCS_ROOT}/vue`],
          ['Frontend', 'Vue 3 + Vite · @copilotkit/vue/v2 1.87.0'],
          ['Runtime', 'Node + tsx · @copilotkit/runtime/v2 1.87.0 on :8200'],
        ]"
      />
    </div>
  </Panel>

  <Panel title="Connection" description="Probed from the browser at `GET /api/copilotkit/info`.">
    <Callout v-if="infoError" tone="error" title="Runtime unreachable">
      {{ infoError }}. Start it with <code>cd backend &amp;&amp; npm run dev</code>.
    </Callout>
    <KeyValue
      v-else
      :rows="[
        ['Runtime URL', RUNTIME_URL],
        ['Runtime version', info?.version ?? 'checking…'],
        ['Agents', info ? Object.keys(info.agents ?? {}).join(', ') : 'checking…'],
        ['Intelligence', PUBLIC_LICENSE_KEY ? 'license key set' : 'no license key — threads pages show their unlicensed behaviour'],
      ]"
    />
  </Panel>

  <Panel title="The nine agents" description="One per doc page whose agent id or constructor config differs. Agent ids match the ones the Vue doc samples use.">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[42rem] text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
            <th class="pb-2 pr-4 font-medium">Agent id</th>
            <th class="pb-2 pr-4 font-medium">Config that matters</th>
            <th class="pb-2 font-medium">Used by</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="[id, config, used] in AGENTS" :key="id" class="align-top">
            <td class="py-2 pr-4 font-mono text-xs text-slate-800 dark:text-slate-100">{{ id }}</td>
            <td class="py-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">{{ config }}</td>
            <td class="py-2 text-slate-600 dark:text-slate-400">{{ used }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Panel>

  <Panel title="Start here">
    <TryIt :prompts="['What can you do?']" pass="On /quickstart, a streamed reply rendered as markdown." fail="An error box: check that OPENAI_API_KEY is set for the backend and restart it." />
    <p class="mt-3 text-sm text-slate-600 dark:text-slate-400">
      The <RouterLink to="/status" class="text-[var(--accent)] underline underline-offset-4">status overview</RouterLink> lists every route in one table.
    </p>
  </Panel>
</template>
