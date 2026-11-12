<script setup lang="ts">
/**
 * Use any model router: BuiltInAgent factory mode, two agents from the doc:
 *  - router-custom: `type: "custom"`, a generator yielding AG-UI events (no LLM)
 *  - router-aisdk:  `type: "aisdk"`, streamText(openai(...)) with tools
 */
import { ref } from "vue";
import { CopilotChat } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import EventLog from "@/components/EventLog.vue";

const MODES = { 'type: "custom"': "router-custom", 'type: "aisdk"': "router-aisdk" } as const;
type Mode = keyof typeof MODES;
const mode = ref<Mode>('type: "custom"');
</script>

<template>
  <DemoFrame parent-path="/backend/custom-agent" subtitle="BuiltInAgent factory mode">
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 gap-1 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <button v-for="(_, m) in MODES" :key="m" type="button" class="tab" :aria-pressed="mode === m" @click="mode = m">{{ m }}</button>
      </div>
      <div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_28rem]" :key="mode">
        <CopilotChat :agent-id="MODES[mode]" />
        <div class="min-h-0 overflow-auto border-l border-slate-200 p-3 dark:border-slate-800">
          <EventLog :agent-id="MODES[mode]" />
        </div>
      </div>
    </div>
  </DemoFrame>
</template>
