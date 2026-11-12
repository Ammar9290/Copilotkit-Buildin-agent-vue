<script setup lang="ts">
// The doc's ThreadSidebar.vue plus the pagination snippet (limit: 20), and the
// error useThreads reports, so a missing Intelligence backend is visible.
import { computed } from "vue";
import { useCopilotChatConfiguration, useThreads } from "@copilotkit/vue/v2";

const config = useCopilotChatConfiguration();
const result = useThreads({ agentId: "my-agent", limit: 20 });
const {
  threads,
  isLoading,
  renameThread,
  archiveThread,
  deleteThread,
  hasMoreThreads,
  isFetchingMoreThreads,
  fetchMoreThreads,
} = result;

const errorText = computed(() => {
  const e = (result as unknown as { error?: { value?: unknown } }).error?.value;
  return e ? String((e as Error).message ?? e) : "";
});
</script>

<template>
  <h3 class="text-sm font-semibold">Threads (useThreads)</h3>
  <p v-if="errorText" class="mt-2 text-xs text-rose-600" data-testid="threads-error">error: {{ errorText }}</p>
  <p v-if="isLoading" class="muted mt-2 text-sm">Loading…</p>
  <ul v-else class="mt-2 space-y-3">
    <li v-if="!threads.length" class="muted text-sm">No threads.</li>
    <li v-for="thread in threads" :key="thread.id" class="text-sm">
      <button type="button" class="font-medium underline" @click="config?.setActiveThreadId(thread.id, { explicit: true })">
        {{ thread.name ?? "New conversation" }}
      </button>
      <div class="row mt-1">
        <button type="button" class="btn" @click="renameThread(thread.id, 'Renamed')">Rename</button>
        <button type="button" class="btn" @click="archiveThread(thread.id)">Archive</button>
        <button type="button" class="btn" @click="deleteThread(thread.id)">Delete</button>
      </div>
    </li>
  </ul>
  <button v-if="hasMoreThreads" type="button" class="btn mt-3" :disabled="isFetchingMoreThreads" @click="fetchMoreThreads">
    {{ isFetchingMoreThreads ? "Loading…" : "Load more" }}
  </button>
</template>
