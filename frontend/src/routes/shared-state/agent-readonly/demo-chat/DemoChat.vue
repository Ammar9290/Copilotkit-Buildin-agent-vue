<script setup lang="ts">
/** Agent Read-Only Context: the doc's WorkspaceContext beside a CopilotChat. */
import { CopilotChat } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import WorkspaceContext from "@/demos/shared-state/WorkspaceContext.vue";
</script>

<template>
  <DemoFrame parent-path="/shared-state/agent-readonly" subtitle="useAgentContext · agent default">
    <div class="grid h-full grid-cols-[20rem_minmax(0,1fr)]">
      <aside class="border-r border-slate-200 p-5 dark:border-slate-800"><WorkspaceContext /></aside>
      <CopilotChat />
    </div>
  </DemoFrame>
</template>
