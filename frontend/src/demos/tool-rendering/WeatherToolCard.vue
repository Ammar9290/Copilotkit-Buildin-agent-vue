<script setup lang="ts">
// The doc's WeatherToolCard.vue: "Checking <city>" while running, the result after.
defineProps<{
  parameters: { city?: string };
  status: "inProgress" | "executing" | "complete";
  result?: string;
}>();
</script>

<template>
  <div class="weather-tool-card my-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm dark:border-sky-900 dark:bg-sky-950/40">
    <p v-if="status !== 'complete'">Checking {{ parameters.city ?? "…" }}</p>
    <article v-else>
      <strong>🌤 {{ parameters.city }}</strong>
      <pre class="mt-2 bg-white/70 dark:bg-slate-950">{{ result }}</pre>
    </article>
  </div>
</template>
