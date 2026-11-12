<script setup lang="ts">
/**
 * Sub-Agents. The Vue doc's delegation-log section has no Vue code and its
 * backend is Python/LangGraph. Ported to the built-in agent: the `subagents`
 * supervisor delegates through three server tools, each delegation renders as
 * a card (useRenderTool), and a live log is built from the tool-call messages.
 */
import { computed } from "vue";
import { z } from "zod";
import { CopilotChat, useAgent, useRenderTool } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import DelegationCard from "@/demos/subagents/DelegationCard.vue";

for (const name of ["research_agent", "writing_agent", "critique_agent"]) {
  useRenderTool({ name, parameters: z.object({ task: z.string() }), render: DelegationCard as never, agentId: "subagents" });
}

const { agent } = useAgent({ agentId: "subagents" });
const delegations = computed(() => {
  const msgs = (agent.value?.messages ?? []) as {
    role: string;
    toolCalls?: { id: string; function: { name: string; arguments: string } }[];
    toolCallId?: string;
  }[];
  const done = new Set(msgs.filter((m) => m.role === "tool").map((m) => m.toolCallId));
  return msgs.flatMap((m) =>
    (m.toolCalls ?? []).map((tc) => {
      let task = tc.function.arguments;
      try {
        task = JSON.parse(tc.function.arguments).task;
      } catch {
        /* still streaming */
      }
      return { id: tc.id, subAgent: tc.function.name, task, status: done.has(tc.id) ? "completed" : "running" };
    }),
  );
});
</script>

<template>
  <DemoFrame parent-path="/multi-agent/subagents" subtitle="supervisor + 3 sub-agent tools · agent subagents">
    <div class="grid h-full grid-cols-[minmax(0,1fr)_24rem]">
      <CopilotChat agent-id="subagents" />
      <aside class="min-h-0 overflow-auto border-l border-slate-200 p-4 dark:border-slate-800">
        <h3 class="text-sm font-semibold">Delegation log</h3>
        <p v-if="!delegations.length" class="muted mt-2 text-sm">No delegations yet.</p>
        <div v-for="d in delegations" :key="d.id" class="delegation-entry border-b border-slate-100 py-2 dark:border-slate-800">
          <div class="flex items-center gap-2 text-sm">
            <strong>{{ d.subAgent }}</strong>
            <span class="badge" :data-status="d.status === 'completed' ? 'working' : 'untested'">{{ d.status }}</span>
          </div>
          <p class="muted mt-0.5 text-xs">{{ d.task }}</p>
        </div>
      </aside>
    </div>
  </DemoFrame>
</template>
