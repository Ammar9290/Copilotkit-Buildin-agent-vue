<script setup lang="ts">
// The doc's src/components/AgentTrigger.vue, plus its `agent.subscribe`
// snippet writing to a visible lifecycle log instead of console.log.
import { ref, toRaw, watch } from "vue";
import { useAgent, useCopilotKit } from "@copilotkit/vue/v2";

const { agent } = useAgent({ agentId: "sales" });
const { copilotkit } = useCopilotKit();
const lifecycle = ref<string[]>([]);
function note(s: string) {
  lifecycle.value = [`${new Date().toLocaleTimeString()} ${s}`, ...lifecycle.value];
}

async function run() {
  const current = agent.value;
  if (!current || current.isRunning) return;

  current.addMessage({
    id: crypto.randomUUID(),
    role: "user",
    content: "Summarize the latest sales data",
  });

  try {
    await copilotkit.value.runAgent({ agent: toRaw(current) });
  } catch (error) {
    console.error("CopilotKit runAgent failed:", error);
    note(`runAgent threw: ${(error as Error).message}`);
  }
}

function stop() {
  const current = agent.value;
  if (!current) return;
  copilotkit.value.stopAgent({ agent: toRaw(current) });
}

watch(
  agent,
  (current, _previous, onCleanup) => {
    if (!current) return;
    const subscription = current.subscribe({
      onRunStartedEvent: () => note("started"),
      onRunFinalized: () => note("done"),
      onRunFailed: ({ error }) => note(`failed: ${error?.message ?? error}`),
    });
    onCleanup(() => subscription.unsubscribe());
  },
  { immediate: true },
);
</script>

<template>
  <div class="row">
    <button type="button" class="btn-primary" :disabled="agent?.isRunning" @click="run">Run agent</button>
    <button type="button" class="btn" :disabled="!agent?.isRunning" @click="stop">Stop</button>
    <span class="muted text-sm">isRunning: {{ agent?.isRunning ?? false }}</span>
  </div>
  <div class="event-log mt-3 min-h-0 flex-1" data-testid="lifecycle-log">
    <div v-if="!lifecycle.length" class="muted">Lifecycle events appear here.</div>
    <div v-for="(l, i) in lifecycle" :key="i">{{ l }}</div>
  </div>
</template>
