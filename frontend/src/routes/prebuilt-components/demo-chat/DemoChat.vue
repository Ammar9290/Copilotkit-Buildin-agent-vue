<script setup lang="ts">
/**
 * Prebuilt Components: the three surfaces over one agent (`my-agent`), one
 * tab each, plus starter suggestions configured by useConfigureSuggestions in
 * a child of the provider.
 */
import { ref } from "vue";
import { CopilotChat, CopilotPopup, CopilotSidebar } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import Suggestions from "@/demos/prebuilt/Suggestions.vue";

type Tab = "CopilotChat" | "CopilotSidebar" | "CopilotPopup";
const tabs: Tab[] = ["CopilotChat", "CopilotSidebar", "CopilotPopup"];
const tab = ref<Tab>("CopilotChat");
</script>

<template>
  <DemoFrame parent-path="/prebuilt-components" subtitle="three surfaces · agent my-agent">
    <Suggestions />
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 gap-1 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <button v-for="t in tabs" :key="t" type="button" class="tab" :aria-pressed="tab === t" @click="tab = t">{{ t }}</button>
      </div>
      <div class="min-h-0 flex-1">
        <CopilotChat v-if="tab === 'CopilotChat'" agent-id="my-agent" />
        <template v-else-if="tab === 'CopilotSidebar'">
          <main class="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">
            Your app. The sidebar is docked at the right edge.
          </main>
          <CopilotSidebar agent-id="my-agent" :default-open="true" />
        </template>
        <template v-else>
          <main class="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">
            Your app. The popup floats bottom-right.
          </main>
          <CopilotPopup agent-id="my-agent" :default-open="true" />
        </template>
      </div>
    </div>
  </DemoFrame>
</template>
