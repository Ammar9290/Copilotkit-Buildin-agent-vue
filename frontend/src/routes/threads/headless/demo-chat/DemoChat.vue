<script setup lang="ts">
/**
 * Headless Threads: the doc's ThreadSidebar (useThreads, agent `my-agent`)
 * next to CopilotChat under one CopilotChatConfigurationProvider.
 */
import { CopilotChat, CopilotChatConfigurationProvider } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import ThreadSidebar from "@/demos/threads/ThreadSidebar.vue";
</script>

<template>
  <DemoFrame parent-path="/threads/headless" subtitle="useThreads · agent my-agent">
    <CopilotChatConfigurationProvider agent-id="my-agent">
      <div class="flex h-full">
        <aside class="w-80 shrink-0 overflow-auto border-r border-slate-200 p-4 dark:border-slate-800" data-testid="thread-sidebar">
          <ThreadSidebar />
        </aside>
        <div class="min-w-0 flex-1"><CopilotChat /></div>
      </div>
    </CopilotChatConfigurationProvider>
  </DemoFrame>
</template>
