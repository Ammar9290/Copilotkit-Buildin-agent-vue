<script setup lang="ts">
// The doc's ControlledChat.vue: app-owned threadId with drawer callbacks.
import { ref } from "vue";
import { CopilotChat, CopilotChatConfigurationProvider, CopilotThreadsDrawer } from "@copilotkit/vue/v2";

const threadId = ref<string>(crypto.randomUUID());
const selectThread = (id: string) => {
  threadId.value = id;
};
const startNewConversation = () => {
  threadId.value = crypto.randomUUID();
};
</script>

<template>
  <CopilotChatConfigurationProvider agent-id="support" :thread-id="threadId">
    <div class="flex h-full">
      <CopilotThreadsDrawer :on-thread-select="selectThread" :on-new-thread="startNewConversation" />
      <main class="flex min-w-0 flex-1 flex-col">
        <header class="row border-b border-slate-200 p-2 text-xs dark:border-slate-800">
          <button type="button" class="btn" @click="startNewConversation">New conversation</button>
          <span class="muted">threadId: <code>{{ threadId }}</code></span>
        </header>
        <div class="min-h-0 flex-1"><CopilotChat /></div>
      </main>
    </div>
  </CopilotChatConfigurationProvider>
</template>
