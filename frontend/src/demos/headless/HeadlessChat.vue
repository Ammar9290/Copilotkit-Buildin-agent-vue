<script setup lang="ts">
// The doc's HeadlessChat.vue minimal example: text only, by design.
import { computed, ref } from "vue";
import { useAgent, useCopilotKit } from "@copilotkit/vue/v2";

const { agent } = useAgent({ agentId: "my-agent" });
const { copilotkit } = useCopilotKit();
const input = ref("");
const messages = computed(() => agent.value?.messages ?? []);
const isRunning = computed(() => agent.value?.isRunning ?? false);

async function submit() {
  const current = agent.value;
  const content = input.value.trim();
  if (!current || !content || isRunning.value) return;

  current.addMessage({
    id: crypto.randomUUID(),
    role: "user",
    content,
  });
  input.value = "";
  await copilotkit.value.runAgent({ agent: current });
}
</script>

<template>
  <section aria-live="polite" class="space-y-2">
    <article
      v-for="message in messages"
      :key="message.id"
      :data-role="message.role"
      class="headless-message rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
      :class="message.role === 'user' ? 'ml-auto max-w-[80%] bg-slate-50 dark:bg-slate-900' : 'max-w-[80%]'"
    >
      {{ message.content }}
    </article>
    <p v-if="isRunning" class="muted text-sm">Thinking…</p>
    <form class="row pt-2" @submit.prevent="submit">
      <input v-model="input" aria-label="Message" placeholder="Type a message" class="field flex-1 py-2" />
      <button type="submit" class="btn-primary" :disabled="isRunning">Send</button>
    </form>
  </section>
</template>
