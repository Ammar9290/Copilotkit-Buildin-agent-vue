<script setup lang="ts">
/**
 * Tool Call Rendering: the doc's three modes, each in its own component so
 * their registrations never overlap — zero-config default, custom catch-all,
 * and a per-tool renderer with the default as fallback. The backend tools
 * (get_weather, search_flights, get_stock_price, roll_d20) are on `default`.
 */
import { ref } from "vue";
import DemoFrame from "@/components/DemoFrame.vue";
import DefaultRenderer from "@/demos/tool-rendering/DefaultRenderer.vue";
import CatchAllRenderer from "@/demos/tool-rendering/CatchAllRenderer.vue";
import PerToolRenderer from "@/demos/tool-rendering/PerToolRenderer.vue";

const MODES = ["Per-tool + fallback", "Default renderer", "Custom catch-all"] as const;
const mode = ref<(typeof MODES)[number]>("Per-tool + fallback");
</script>

<template>
  <DemoFrame parent-path="/generative-ui/tool-rendering" subtitle="useRenderTool · useDefaultRenderTool · agent default">
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 gap-1 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <button v-for="m in MODES" :key="m" type="button" class="tab" :aria-pressed="mode === m" @click="mode = m">{{ m }}</button>
      </div>
      <div class="min-h-0 flex-1" :key="mode">
        <PerToolRenderer v-if="mode === 'Per-tool + fallback'" />
        <DefaultRenderer v-else-if="mode === 'Default renderer'" />
        <CatchAllRenderer v-else />
      </div>
    </div>
  </DemoFrame>
</template>
