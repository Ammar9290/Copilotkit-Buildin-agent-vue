<script setup lang="ts">
/**
 * Every notes route renders this. It resolves its own metadata from the path,
 * so a page can never drift from the nav or the status table.
 */
import { computed } from "vue";
import { demoPath, docUrl, findRoute } from "../lib/nav-config";
import { capturedErrors, clearErrors } from "../lib/errors";
import StatusBadge from "./StatusBadge.vue";
import RichText from "./ui/RichText.vue";

const props = defineProps<{ path: string }>();
const route = computed(() => findRoute(props.path));
const demo = computed(() => (route.value ? demoPath(route.value) : undefined));
</script>

<template>
  <header v-if="!route" class="border-b border-rose-300 pb-4">
    <p class="text-sm text-rose-700">No nav entry registered for <code>{{ path }}</code>.</p>
  </header>
  <header v-else class="border-b border-slate-200 pb-5 dark:border-slate-800">
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{{ route.title }}</h1>
      <StatusBadge :status="route.status" />
      <span
        v-if="route.premium"
        class="inline-flex items-center rounded-full border border-sky-300 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200"
      >
        Requires Intelligence
      </span>
    </div>

    <p class="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400"><RichText :text="route.summary" /></p>
    <p v-if="route.statusNote" class="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-500">
      <RichText :text="route.statusNote" />
    </p>

    <div class="mt-4 flex flex-wrap items-center gap-3 text-sm">
      <!-- Always a new tab: the demo route is chrome-free and meant to be recorded on its own. -->
      <a v-if="demo" :href="demo" target="_blank" rel="noreferrer" class="rounded-md bg-[var(--accent)] px-3 py-1.5 font-medium text-white">
        Open demo ↗
      </a>
      <a :href="docUrl(route)" target="_blank" rel="noreferrer" class="font-medium text-[var(--accent)] underline underline-offset-4">
        Doc page being tested ↗
      </a>
      <RouterLink to="/status" class="text-slate-500 underline underline-offset-4 hover:text-slate-800 dark:hover:text-slate-200">
        All statuses
      </RouterLink>
    </div>

    <div v-if="capturedErrors.length" class="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
      <div class="flex items-center justify-between gap-3">
        <p class="font-semibold">{{ capturedErrors.length }} CopilotKit error(s) captured via onError</p>
        <button type="button" class="text-xs underline" @click="clearErrors">Clear</button>
      </div>
      <ul class="mt-1 space-y-0.5 text-xs">
        <li v-for="(e, i) in capturedErrors" :key="i"><code>{{ e.at }} [{{ e.code }}]</code> {{ e.message }}</li>
      </ul>
    </div>
  </header>
</template>
