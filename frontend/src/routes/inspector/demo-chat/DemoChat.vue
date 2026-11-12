<script setup lang="ts">
/**
 * Inspector: CopilotKitProvider mounts the overlay automatically in dev
 * builds. This page registers a frontend tool and some context so the
 * Inspector's Frontend Tools and Context panes have something to show.
 */
import { z } from "zod";
import { ref } from "vue";
import { CopilotChat, useAgentContext, useFrontendTool } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";

const pinged = ref(0);
useFrontendTool({
  name: "inspector_ping",
  description: "Increment the on-page ping counter (for Inspector testing).",
  parameters: z.object({}),
  handler: async () => {
    pinged.value++;
    return { pinged: pinged.value };
  },
});
useAgentContext({ description: "Inspector test page", value: { page: "inspector", purpose: "QA" } });
</script>

<template>
  <DemoFrame parent-path="/inspector" subtitle="dev overlay · inspector_ping tool · context">
    <div class="grid h-full grid-cols-[minmax(0,1fr)_20rem]">
      <CopilotChat />
      <aside class="border-l border-slate-200 p-4 text-sm dark:border-slate-800">
        <h3 class="font-semibold">Registered for the Inspector</h3>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-slate-600 dark:text-slate-400">
          <li>frontend tool <code>inspector_ping</code></li>
          <li>context “Inspector test page”</li>
        </ul>
        <p class="mt-4">inspector_ping calls: <strong data-testid="ping-count">{{ pinged }}</strong></p>
        <p class="muted mt-4 text-xs">The Inspector button sits in a corner of the window in dev builds.</p>
      </aside>
    </div>
  </DemoFrame>
</template>
