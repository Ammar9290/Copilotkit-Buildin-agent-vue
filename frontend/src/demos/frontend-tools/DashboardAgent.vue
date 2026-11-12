<script setup lang="ts">
import { computed, ref } from "vue";
import { z } from "zod";
import { CopilotChat, useFrontendTool } from "@copilotkit/vue/v2";

const severity = ref("all");

useFrontendTool(
  {
    name: "filter_incidents",
    description: "Filter the visible incident list by severity.",
    parameters: z.object({
      severity: z.enum(["all", "sev1", "sev2", "sev3"]),
    }),
    handler: async ({ severity: nextSeverity }) => {
      severity.value = nextSeverity;
      return { applied: true, severity: nextSeverity };
    },
  },
  [severity],
);

// Test-suite addition: something for the filter to act on.
const incidents = [
  { id: "INC-101", sev: "sev1", title: "Checkout API 500s" },
  { id: "INC-102", sev: "sev2", title: "Slow search results" },
  { id: "INC-103", sev: "sev3", title: "Typo on pricing page" },
  { id: "INC-104", sev: "sev1", title: "Login outage in EU" },
];
const visible = computed(() => (severity.value === "all" ? incidents : incidents.filter((i) => i.sev === severity.value)));
</script>

<template>
  <div class="grid h-full grid-cols-[22rem_minmax(0,1fr)]">
    <aside class="border-r border-slate-200 p-5 dark:border-slate-800">
      <p class="text-sm">Current filter: <strong data-testid="current-filter">{{ severity }}</strong></p>
      <ul class="mt-3 space-y-2" data-testid="incident-list">
        <li v-for="i in visible" :key="i.id" class="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
          <span :class="['badge mr-2', i.sev === 'sev1' ? 'border-rose-300 text-rose-700' : '']">{{ i.sev }}</span>
          {{ i.id }} · {{ i.title }}
        </li>
      </ul>
    </aside>
    <CopilotChat />
  </div>
</template>
