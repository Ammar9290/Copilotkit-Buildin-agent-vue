<script setup lang="ts">
defineProps<{
  name: string;
  parameters: { task?: string };
  status: "inProgress" | "executing" | "complete";
  result?: string;
}>();

const ICON: Record<string, string> = { research_agent: "🔎", writing_agent: "✍️", critique_agent: "🧐" };
</script>

<template>
  <article class="delegation-card my-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <strong>{{ ICON[name] ?? "🤖" }} {{ name }}</strong>
    <span class="muted"> · {{ status }}</span>
    <p class="muted mt-1">{{ parameters.task ?? "…" }}</p>
    <pre v-if="result" class="mt-2 whitespace-pre-wrap">{{ result }}</pre>
  </article>
</template>
