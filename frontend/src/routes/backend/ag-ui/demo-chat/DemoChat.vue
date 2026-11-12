<script setup lang="ts">
/**
 * Connect AG-UI agents: agent.subscribe with every callback in the doc's
 * event table, and the proxy pattern — the frontend agent is a client-side
 * proxy, not the server-side BuiltInAgent.
 */
import { computed, ref } from "vue";
import { CopilotChat, useAgent } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import EventLog from "@/components/EventLog.vue";

const AGENTS = ["router-custom", "default"] as const;
const agentId = ref<(typeof AGENTS)[number]>("router-custom");
const { agent } = useAgent({ agentId: () => agentId.value });
const proxyClass = computed(() => (agent.value as unknown as { constructor?: { name?: string } } | null)?.constructor?.name ?? "—");
</script>

<template>
  <DemoFrame parent-path="/backend/ag-ui" subtitle="agent.subscribe · proxy pattern">
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 items-center gap-1 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <button v-for="a in AGENTS" :key="a" type="button" class="tab" :aria-pressed="agentId === a" @click="agentId = a">{{ a }}</button>
        <span class="ml-auto text-xs text-slate-500">frontend agent class: <code data-testid="proxy-class">{{ proxyClass }}</code></span>
      </div>
      <div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_30rem]" :key="agentId">
        <CopilotChat :agent-id="agentId" />
        <div class="min-h-0 overflow-auto border-l border-slate-200 p-3 dark:border-slate-800">
          <EventLog :agent-id="agentId" title="agent.subscribe(...)" />
        </div>
      </div>
    </div>
  </DemoFrame>
</template>
