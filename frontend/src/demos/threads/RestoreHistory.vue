<script setup lang="ts">
// The doc's RestoreHistory.vue, with a preview of what was restored.
// Note: it calls setMessages on the shared `my-agent` instance.
import { computed, ref, watch } from "vue";
import { useAgent } from "@copilotkit/vue/v2";
import { myApi } from "./myApi";

const props = defineProps<{ threadId: string }>();
const { agent } = useAgent({ agentId: "my-agent" });
const status = ref("");

watch(
  [() => agent.value, () => props.threadId],
  async ([current, threadId], _previous, onCleanup) => {
    if (!current) return;
    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
    });

    try {
      status.value = "loading…";
      const messages = await myApi.getMessages(threadId);
      if (!cancelled) {
        current.setMessages(messages);
        status.value = `restored ${messages.length} message(s)`;
      }
    } catch (e) {
      if (!cancelled) status.value = `error: ${(e as Error).message}`;
    }
  },
  { immediate: true },
);

const preview = computed(() => agent.value?.messages ?? []);
</script>

<template>
  <p class="muted mt-2 text-xs" data-testid="restore-status">{{ status }}</p>
  <div class="event-log mt-1 max-h-40">
    <div v-for="m in preview" :key="m.id"><strong>{{ m.role }}</strong> {{ typeof m.content === "string" ? m.content : "" }}</div>
  </div>
</template>
