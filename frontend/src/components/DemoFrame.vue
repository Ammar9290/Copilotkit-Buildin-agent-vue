<script setup lang="ts">
/**
 * Chrome for a `/demo-chat` route: one thin bar, then the demo filling the rest
 * of the viewport. Kept minimal because these routes exist to be recorded.
 */
import { computed } from "vue";
import { docUrl, findRoute } from "../lib/nav-config";

const props = defineProps<{ parentPath: string; subtitle?: string }>();
const route = computed(() => findRoute(props.parentPath));
</script>

<template>
  <div class="flex h-dvh flex-col bg-white dark:bg-slate-950">
    <header
      class="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-slate-200 px-4 py-2 pr-24 dark:border-slate-800"
    >
      <div class="flex min-w-0 items-baseline gap-2">
        <h1 class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{{ route?.title ?? "Demo" }}</h1>
        <span v-if="subtitle" class="truncate text-xs text-slate-500">{{ subtitle }}</span>
      </div>
      <div class="flex shrink-0 items-center gap-3 text-xs">
        <RouterLink :to="parentPath" class="text-slate-500 underline underline-offset-4 hover:text-slate-800 dark:hover:text-slate-200">
          ← Notes &amp; source
        </RouterLink>
        <a v-if="route" :href="docUrl(route)" target="_blank" rel="noreferrer" class="text-[var(--accent)] underline underline-offset-4">Doc ↗</a>
      </div>
    </header>
    <div class="min-h-0 flex-1 overflow-hidden"><slot /></div>
  </div>
</template>
