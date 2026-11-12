<script setup lang="ts">
/**
 * Shared State: the doc's SharedWorkspace (read + write of `workspace` state)
 * beside `<CopilotChat agent-id="workspace" />`, plus the raw state.
 */
import { computed } from "vue";
import { CopilotChat, useAgent, UseAgentUpdate } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import SharedWorkspace from "@/demos/shared-state/SharedWorkspace.vue";

const { agent } = useAgent({ agentId: "workspace", updates: [UseAgentUpdate.OnStateChanged] });
const raw = computed(() => JSON.stringify(agent.value?.state ?? {}, null, 2));
</script>

<template>
  <DemoFrame parent-path="/shared-state" subtitle="agent.state · setState · agent workspace">
    <div class="grid h-full grid-cols-[24rem_minmax(0,1fr)]">
      <aside class="space-y-4 overflow-auto border-r border-slate-200 p-5 dark:border-slate-800">
        <section class="panel">
          <h3>SharedWorkspace.vue</h3>
          <SharedWorkspace />
        </section>
        <section class="panel">
          <h3>agent.state</h3>
          <pre data-testid="raw-state">{{ raw }}</pre>
        </section>
      </aside>
      <CopilotChat agent-id="workspace" />
    </div>
  </DemoFrame>
</template>
