<script setup lang="ts">
/** Label/value grid. A row's optional third entry makes the value a link. */
defineProps<{ rows: [label: string, value: string, href?: string][] }>();
</script>

<template>
  <dl class="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-4 gap-y-2 text-sm">
    <div v-for="[k, v, href] in rows" :key="k" class="contents">
      <dt class="font-medium text-slate-500 dark:text-slate-400">{{ k }}</dt>
      <dd class="min-w-0 break-words text-slate-800 dark:text-slate-200">
        <a v-if="href" :href="href" target="_blank" rel="noreferrer" class="text-[var(--accent)] underline underline-offset-4">{{ v }}</a>
        <template v-else>{{ v }}</template>
      </dd>
    </div>
  </dl>
</template>
