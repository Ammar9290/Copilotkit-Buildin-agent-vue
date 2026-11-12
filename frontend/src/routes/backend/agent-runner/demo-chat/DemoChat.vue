<script setup lang="ts">
/**
 * AgentRunner and persistence: the runtime uses
 * `new InMemoryAgentRunner({ maxThreads: 200, maxRunsPerThread: 50, maxBytes: 128 MiB })`.
 * Run a conversation on an explicit thread, then read back what the runner stored.
 */
import { ref } from "vue";
import { CopilotChat } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import { RUNTIME_URL } from "@/config";

const threadId = ref(`runner-${crypto.randomUUID().slice(0, 8)}`);
const stored = ref("");

async function read(kind: "messages" | "events" | "state") {
  const res = await fetch(`${RUNTIME_URL}/threads/${threadId.value}/${kind}`);
  const text = await res.text();
  try {
    stored.value = `${res.status}\n${JSON.stringify(JSON.parse(text), null, 2)}`;
  } catch {
    stored.value = `${res.status}\n${text}`;
  }
}
</script>

<template>
  <DemoFrame parent-path="/backend/agent-runner" subtitle="InMemoryAgentRunner · agent router-custom">
    <div class="grid h-full grid-cols-2">
      <CopilotChat agent-id="router-custom" :thread-id="threadId" />
      <aside class="flex min-h-0 flex-col border-l border-slate-200 p-4 dark:border-slate-800">
        <h3 class="text-sm font-semibold">What the runner stored for <code>{{ threadId }}</code></h3>
        <div class="row mt-2">
          <button type="button" class="btn" @click="read('messages')">messages</button>
          <button type="button" class="btn" @click="read('events')">events</button>
          <button type="button" class="btn" @click="read('state')">state</button>
        </div>
        <pre class="mt-3 min-h-0 flex-1 !max-h-none" data-testid="runner-output">{{ stored || "(nothing read yet)" }}</pre>
      </aside>
    </div>
  </DemoFrame>
</template>
