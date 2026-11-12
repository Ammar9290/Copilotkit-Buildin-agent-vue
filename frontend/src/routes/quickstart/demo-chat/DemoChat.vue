<script setup lang="ts">
/**
 * The Quickstart's own UI: a full-height <CopilotChat /> below
 * CopilotKitProvider. No agent-id, so it resolves to the runtime's `default`
 * BuiltInAgent. The provider is in src/App.vue, as the doc's App.vue has it.
 */
import { CopilotChat } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
</script>

<template>
  <DemoFrame parent-path="/quickstart" subtitle="CopilotChat · default agent">
    <div class="h-full">
      <CopilotChat />
    </div>
  </DemoFrame>
</template>
