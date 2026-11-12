<script setup lang="ts">
/**
 * Programmatic Control: the doc's AgentTrigger (agent `sales`) with its
 * agent.subscribe lifecycle log, and the messages the run produces. No chat UI.
 */
import { computed } from "vue";
import { useAgent } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import AgentTrigger from "@/demos/programmatic/AgentTrigger.vue";

const { agent } = useAgent({ agentId: "sales" });
const messages = computed(() => agent.value?.messages ?? []);

function text(m: { content?: unknown; toolCalls?: unknown }): string {
  return typeof m.content === "string" && m.content ? m.content : JSON.stringify(m.content ?? m.toolCalls ?? "");
}
</script>

<template>
  <DemoFrame parent-path="/programmatic-control" subtitle="addMessage · runAgent · stopAgent · subscribe · agent sales">
    <div class="grid h-full grid-cols-2 gap-4 p-6">
      <section class="panel flex min-h-0 flex-col">
        <h3>AgentTrigger.vue</h3>
        <AgentTrigger />
      </section>
      <section class="panel flex min-h-0 flex-col">
        <h3>Agent messages (sales)</h3>
        <div class="event-log min-h-0 flex-1" data-testid="sales-messages">
          <div v-if="!messages.length" class="muted">None yet.</div>
          <div v-for="m in messages" :key="m.id" :data-role="m.role">
            <strong>{{ m.role }}</strong> {{ text(m as never) }}
          </div>
        </div>
      </section>
    </div>
  </DemoFrame>
</template>
