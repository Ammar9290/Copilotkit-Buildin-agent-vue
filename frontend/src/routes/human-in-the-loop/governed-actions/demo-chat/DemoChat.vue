<script setup lang="ts">
/**
 * Governed Action Approval UI: the doc's provider setup, i.e.
 * GovernedActionApproval (useInterrupt, renderInChat: false) +
 * GovernedActionTool (useHumanInTheLoop) + CopilotChat, plus a raw view of
 * whatever interrupt reaches the client.
 */
import { CopilotChat, useInterrupt } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import GovernedActionApproval from "@/demos/governed/GovernedActionApproval.vue";
import GovernedActionTool from "@/demos/governed/GovernedActionTool.vue";

// A separate observer so the raw interrupt payload is visible for QA.
const { interrupt: rawInterrupt, slotProps: rawSlotProps } = useInterrupt({ renderInChat: false });
</script>

<template>
  <DemoFrame parent-path="/human-in-the-loop/governed-actions" subtitle="useInterrupt + useHumanInTheLoop · agent default">
    <GovernedActionTool />
    <div class="grid h-full grid-cols-[24rem_minmax(0,1fr)]">
      <aside class="space-y-4 overflow-auto border-r border-slate-200 p-5 dark:border-slate-800">
        <section class="panel">
          <h3>GovernedActionApproval (useInterrupt)</h3>
          <GovernedActionApproval />
          <p class="muted text-xs">Renders only if interrupt.metadata.action is present.</p>
        </section>
        <section class="panel">
          <h3>Raw interrupt seen by useInterrupt</h3>
          <pre data-testid="raw-interrupt">{{ JSON.stringify({ event: rawInterrupt, interrupt: rawSlotProps?.interrupt ?? null }, null, 2) }}</pre>
        </section>
      </aside>
      <CopilotChat />
    </div>
  </DemoFrame>
</template>
