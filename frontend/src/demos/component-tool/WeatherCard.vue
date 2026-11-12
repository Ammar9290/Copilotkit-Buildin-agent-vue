<script setup lang="ts">
defineProps<{ city: string; temperature: number; condition: string }>();
</script>

<template>
  <article class="weather-card my-2 max-w-xs rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white px-5 py-4 shadow-sm dark:border-slate-800 dark:from-sky-950/50 dark:to-slate-900">
    <strong class="text-base">{{ city }}</strong>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ temperature }}° · {{ condition }}</p>
  </article>
</template>
