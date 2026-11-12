<script setup lang="ts">
// Catch-all renderer: receives every tool call's name/status/parameters/result.
defineProps<{
  name: string;
  toolCallId: string;
  parameters: unknown;
  status: "inProgress" | "executing" | "complete";
  result?: string;
}>();
</script>

<template>
  <article class="branded-tool-card my-2 rounded-xl border border-violet-300 bg-violet-50 px-4 py-3 text-sm dark:border-violet-900 dark:bg-violet-950/40">
    <div class="flex items-center justify-between">
      <strong>🔧 BrandedToolCard · {{ name }}</strong>
      <span class="badge" :data-status="status === 'complete' ? 'working' : 'untested'">{{ status }}</span>
    </div>
    <pre class="mt-2 bg-white/70 dark:bg-slate-950">{{ JSON.stringify(parameters, null, 2) }}</pre>
    <pre v-if="result" class="mt-2 bg-white/70 dark:bg-slate-950">{{ result }}</pre>
  </article>
</template>
