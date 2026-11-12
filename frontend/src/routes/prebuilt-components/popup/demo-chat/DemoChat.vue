<script setup lang="ts">
/** CopilotPopup: width / height / default-open / click-outside-to-close. */
import { CopilotPopup } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
</script>

<template>
  <DemoFrame parent-path="/prebuilt-components/popup" subtitle="420×560 · click-outside-to-close · agent my-agent">
    <main class="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">Your App</h1>
      <p class="max-w-md text-sm text-slate-500">The popup floats over this content. Click outside it to close it.</p>
    </main>
    <CopilotPopup agent-id="my-agent" :default-open="true" :width="420" :height="560" :click-outside-to-close="true" />
  </DemoFrame>
</template>
