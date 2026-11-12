<script setup lang="ts">
// Not shown in the doc; written against the documented render props
// (status / args / respond).
import { ref } from "vue";

const props = defineProps<{
  status: "inProgress" | "executing" | "complete";
  args: { topic?: string; attendee?: string };
  respond?: (result: unknown) => Promise<void>;
  result?: unknown;
}>();

const slots = ["Tue 10:00", "Wed 14:30", "Fri 09:15"];
const chosen = ref<string | null>(null);

function pick(slot: string | null) {
  if (!props.respond || chosen.value) return;
  chosen.value = slot ?? "declined";
  void props.respond(slot ? { approved: true, time: slot } : { approved: false });
}
</script>

<template>
  <section class="time-picker-card my-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <strong>📅 {{ args.topic ?? "…" }}</strong> with {{ args.attendee ?? "…" }}
    <div class="muted text-xs">status: {{ status }}</div>
    <div v-if="status === 'executing' && !chosen" class="row mt-2">
      <button v-for="s in slots" :key="s" type="button" class="btn" @click="pick(s)">{{ s }}</button>
      <button type="button" class="btn" @click="pick(null)">Decline</button>
    </div>
    <p v-else-if="chosen" class="mt-1">Chosen: <strong>{{ chosen }}</strong></p>
  </section>
</template>
