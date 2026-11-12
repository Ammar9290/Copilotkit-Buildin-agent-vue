<script setup lang="ts">
/**
 * Raw AG-UI event log for one agent, built on `agent.subscribe(...)` with the
 * callbacks listed on the "Connect AG-UI agents" doc page.
 */
import { ref, watch } from "vue";
import { useAgent } from "@copilotkit/vue/v2";

const props = defineProps<{ agentId?: string; title?: string }>();

const { agent } = useAgent({ agentId: () => props.agentId });
const lines = ref<{ t: string; name: string; body: string }[]>([]);

function push(name: string, payload: unknown) {
  let body = "";
  try {
    const p = payload as { event?: unknown };
    body = JSON.stringify(p?.event ?? payload);
  } catch {
    body = String(payload);
  }
  lines.value = [
    ...lines.value,
    { t: new Date().toLocaleTimeString(), name, body: body.length > 600 ? `${body.slice(0, 600)}…` : body },
  ].slice(-400);
}

const CALLBACKS = [
  "onRunStartedEvent",
  "onRunFinishedEvent",
  "onRunErrorEvent",
  "onStepStartedEvent",
  "onStepFinishedEvent",
  "onTextMessageStartEvent",
  "onTextMessageContentEvent",
  "onTextMessageEndEvent",
  "onToolCallStartEvent",
  "onToolCallArgsEvent",
  "onToolCallEndEvent",
  "onToolCallResultEvent",
  "onStateSnapshotEvent",
  "onStateDeltaEvent",
  "onMessagesSnapshotEvent",
  "onCustomEvent",
  "onRawEvent",
  "onRunFinalized",
  "onRunFailed",
] as const;

watch(
  agent,
  (current, _prev, onCleanup) => {
    if (!current) return;
    const subscriber: Record<string, (p: unknown) => void> = {};
    for (const name of CALLBACKS) subscriber[name] = (p) => push(name, p);
    const subscription = current.subscribe(subscriber as never);
    onCleanup(() => subscription.unsubscribe());
  },
  { immediate: true },
);
</script>

<template>
  <div class="panel">
    <div class="row" style="justify-content: space-between">
      <h3 style="margin: 0">{{ title ?? "AG-UI events" }} <span class="muted">— agent: {{ agentId ?? "default" }}</span></h3>
      <button type="button" @click="lines = []">Clear</button>
    </div>
    <p v-if="!agent" class="muted">Agent not resolved yet (is the runtime running?).</p>
    <div class="event-log" style="margin-top: 8px">
      <div v-if="!lines.length" class="muted">No events yet. Send a message.</div>
      <div v-for="(l, i) in lines" :key="i">
        <span class="muted">{{ l.t }}</span> <strong>{{ l.name }}</strong> {{ l.body }}
      </div>
    </div>
  </div>
</template>
