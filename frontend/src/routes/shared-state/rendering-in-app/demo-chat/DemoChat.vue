<script setup lang="ts">
/** Render agent state in your app: the doc's Canvas beside a CopilotChat (default agent). */
import { CopilotChat } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import Canvas from "@/demos/shared-state/Canvas.vue";
</script>

<template>
  <DemoFrame parent-path="/shared-state/rendering-in-app" subtitle="Canvas.vue · setState write-back · agent default">
    <div class="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="overflow-auto border-r border-slate-200 p-6 dark:border-slate-800"><Canvas /></div>
      <CopilotChat />
    </div>
  </DemoFrame>
</template>
