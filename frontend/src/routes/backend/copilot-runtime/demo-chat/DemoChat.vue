<script setup lang="ts">
/**
 * Copilot Runtime: what the runtime registers (GET /info), and the doc's
 * "Connecting to an AG-UI agent directly" sample in DirectAgUi.
 */
import { onMounted, ref } from "vue";
import DemoFrame from "@/components/DemoFrame.vue";
import DirectAgUi from "@/demos/runtime/DirectAgUi.vue";
import { RUNTIME_URL } from "@/config";

const info = ref<{ version?: string; agents?: Record<string, { className?: string }> } | null>(null);
const error = ref("");
onMounted(async () => {
  try {
    info.value = await (await fetch(`${RUNTIME_URL}/info`)).json();
  } catch (e) {
    error.value = (e as Error).message;
  }
});
</script>

<template>
  <DemoFrame parent-path="/backend/copilot-runtime" subtitle="GET /info · agents__unsafe_dev_only + HttpAgent">
    <div class="grid h-full grid-cols-2 gap-4 p-4">
      <section class="panel min-h-0 overflow-auto">
        <h3>GET {{ RUNTIME_URL }}/info</h3>
        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
        <p v-if="info" class="text-sm">Runtime <strong>{{ info.version }}</strong> · {{ Object.keys(info.agents ?? {}).length }} agents</p>
        <table v-if="info" class="mt-3 w-full text-left text-sm" data-testid="agent-table">
          <thead>
            <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
              <th class="pb-2">Routing key (agent-id)</th>
              <th class="pb-2">Class</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="(a, id) in info.agents" :key="id">
              <td class="py-1.5 font-mono text-xs">{{ id }}</td>
              <td class="py-1.5 font-mono text-xs text-slate-500">{{ a.className }}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <DirectAgUi />
    </div>
  </DemoFrame>
</template>
