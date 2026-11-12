<script setup lang="ts">
/**
 * Thread & History Lifecycle:
 *  1. an explicit thread-id, and history replay when the chat remounts
 *  2. RestoreHistory: app-owned history applied with agent.setMessages
 *  3. ThreadControls: setActiveThreadId / startNewThread
 * `myApi` stands in for "your own API" and reads the runtime's thread routes.
 */
import { ref } from "vue";
import { CopilotChat, CopilotChatConfigurationProvider } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import RestoreHistory from "@/demos/threads/RestoreHistory.vue";
import ThreadControls from "@/demos/threads/ThreadControls.vue";

const myThreadId = ref(`lifecycle-${crypto.randomUUID().slice(0, 8)}`);
const mountKey = ref(0);
const restoreFrom = ref("");
</script>

<template>
  <DemoFrame parent-path="/threads/lifecycle" subtitle="explicit thread-id · replay · setMessages · switching">
    <div class="grid h-full grid-cols-2 gap-4 p-4">
      <section class="panel flex min-h-0 flex-col">
        <h3>1 · Explicit threadId</h3>
        <div class="row mb-2 text-xs">
          <code>{{ myThreadId }}</code>
          <button type="button" class="btn" @click="mountKey++">Remount chat</button>
        </div>
        <div class="min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800" data-testid="explicit-chat">
          <CopilotChat :key="mountKey" agent-id="my-agent" :thread-id="myThreadId" />
        </div>
      </section>
      <div class="flex min-h-0 flex-col gap-4">
        <section class="panel">
          <h3>2 · RestoreHistory</h3>
          <div class="row">
            <input v-model="restoreFrom" placeholder="threadId to restore" class="field flex-1" aria-label="threadId to restore" />
            <button type="button" class="btn" @click="restoreFrom = myThreadId">Use #1's id</button>
          </div>
          <RestoreHistory v-if="restoreFrom" :thread-id="restoreFrom" />
        </section>
        <section class="panel flex min-h-0 flex-1 flex-col">
          <h3>3 · Switching threads</h3>
          <!-- Its own agent: a configuration provider sets the thread on the
               agent instance, and sharing `my-agent` with panel 1 would move
               panel 1's explicit thread-id to this provider's thread. -->
          <CopilotChatConfigurationProvider agent-id="support">
            <ThreadControls :existing-id="myThreadId" />
            <div class="mt-2 min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <CopilotChat />
            </div>
          </CopilotChatConfigurationProvider>
        </section>
      </div>
    </div>
  </DemoFrame>
</template>
