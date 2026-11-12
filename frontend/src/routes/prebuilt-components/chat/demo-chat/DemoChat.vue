<script setup lang="ts">
/**
 * CopilotChat: the doc's basic setup plus the props and events from its
 * table, with every event written to a visible log.
 */
import { ref } from "vue";
import { CopilotChat, type CopilotChatLabels } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";

const events = ref<string[]>([]);
function log(name: string, payload?: unknown) {
  const body = payload === undefined ? "" : JSON.stringify(payload);
  events.value = [`${new Date().toLocaleTimeString()} ${name} ${body}`, ...events.value].slice(0, 40);
}
function onError(e: { error?: Error }) {
  log("on-error", e.error?.message ?? String(e));
}

// Known typing issue (1.87.0): `labels` is typed as the literal default
// strings, so a custom string is a TS error although it works at runtime.
const labels = {
  chatInputPlaceholder: "Ask my-agent anything…",
  welcomeMessageText: "Test-suite chat: say hi.",
  chatDisclaimerText: "Test harness. Responses may be inaccurate.",
} as unknown as Partial<CopilotChatLabels>;
</script>

<template>
  <DemoFrame parent-path="/prebuilt-components/chat" subtitle="props + events · agent my-agent">
    <div class="grid h-full grid-cols-[minmax(0,1fr)_22rem]">
      <CopilotChat
        agent-id="my-agent"
        auto-scroll="pin-to-bottom"
        :labels="labels"
        :on-error="onError"
        @submit-message="(m: unknown) => log('submit-message', m)"
        @input-change="(v: unknown) => log('input-change', v)"
        @select-suggestion="(s: unknown) => log('select-suggestion', s)"
        @stop="() => log('stop')"
      />
      <aside class="flex min-h-0 flex-col border-l border-slate-200 p-4 dark:border-slate-800">
        <h3 class="text-sm font-semibold">Events</h3>
        <div class="event-log mt-2 min-h-0 flex-1" data-testid="chat-events">
          <div v-if="!events.length" class="muted">Nothing yet.</div>
          <div v-for="(e, i) in events" :key="i">{{ e }}</div>
        </div>
      </aside>
    </div>
  </DemoFrame>
</template>
