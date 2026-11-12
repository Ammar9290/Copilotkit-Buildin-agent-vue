<script setup lang="ts">
/**
 * Fully Headless UI: the doc's minimal example (HeadlessChat) and complete
 * example (RenderedMessages), both under CopilotChatConfigurationProvider as
 * the doc recommends.
 */
import { ref } from "vue";
import { CopilotChatConfigurationProvider } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import HeadlessChat from "@/demos/headless/HeadlessChat.vue";
import RenderedMessages from "@/demos/headless/RenderedMessages.vue";

const tab = ref<"Minimal" | "Complete">("Minimal");
</script>

<template>
  <DemoFrame parent-path="/custom-look-and-feel/headless-ui" subtitle="useAgent + useCopilotKit · agent my-agent">
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 gap-1 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <button type="button" class="tab" :aria-pressed="tab === 'Minimal'" @click="tab = 'Minimal'">Minimal</button>
        <button type="button" class="tab" :aria-pressed="tab === 'Complete'" @click="tab = 'Complete'">Complete</button>
      </div>
      <CopilotChatConfigurationProvider agent-id="my-agent">
        <div class="min-h-0 flex-1 overflow-auto p-6">
          <div class="mx-auto max-w-3xl">
            <HeadlessChat v-if="tab === 'Minimal'" />
            <RenderedMessages v-else />
          </div>
        </div>
      </CopilotChatConfigurationProvider>
    </div>
  </DemoFrame>
</template>
