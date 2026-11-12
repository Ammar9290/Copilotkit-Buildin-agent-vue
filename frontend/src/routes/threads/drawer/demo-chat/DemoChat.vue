<script setup lang="ts">
/**
 * Threads Drawer: the doc's App.vue (drawer + chat sharing one
 * CopilotChatConfigurationProvider, agent `support`), its toolbar
 * NewConversationButton and `#row` slot, and the controlled-threadId variant.
 */
import { ref } from "vue";
import { CopilotChat, CopilotChatConfigurationProvider, CopilotThreadsDrawer } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import NewConversationButton from "@/demos/threads/NewConversationButton.vue";
import ControlledChat from "@/demos/threads/ControlledChat.vue";

const mode = ref<"Shared configuration" | "Controlled threadId">("Shared configuration");
</script>

<template>
  <DemoFrame parent-path="/threads/drawer" subtitle="CopilotThreadsDrawer · agent support">
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 gap-1 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <button type="button" class="tab" :aria-pressed="mode === 'Shared configuration'" @click="mode = 'Shared configuration'">Shared configuration</button>
        <button type="button" class="tab" :aria-pressed="mode === 'Controlled threadId'" @click="mode = 'Controlled threadId'">Controlled threadId</button>
      </div>
      <div class="min-h-0 flex-1">
        <CopilotChatConfigurationProvider v-if="mode === 'Shared configuration'" agent-id="support">
          <div class="flex h-full">
            <CopilotThreadsDrawer>
              <span slot="header">My conversations</span>
              <template #row="{ thread }">
                <strong>{{ thread.name ?? "New conversation" }}</strong>
              </template>
            </CopilotThreadsDrawer>
            <main class="flex min-w-0 flex-1 flex-col">
              <header class="border-b border-slate-200 p-2 dark:border-slate-800"><NewConversationButton /></header>
              <div class="min-h-0 flex-1"><CopilotChat /></div>
            </main>
          </div>
        </CopilotChatConfigurationProvider>
        <ControlledChat v-else />
      </div>
    </div>
  </DemoFrame>
</template>
