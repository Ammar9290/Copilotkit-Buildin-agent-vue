<script setup lang="ts">
// The doc's Canvas.vue + the "Writing back from the main view" toggleItem.
import { computed, watchEffect } from "vue";
import { useAgent, UseAgentUpdate } from "@copilotkit/vue/v2";

type CanvasState = {
  title: string;
  items: { id: string; label: string; done: boolean }[];
};

const initialState: CanvasState = {
  title: "Project launch",
  items: [
    { id: "research", label: "Research user needs", done: true },
    { id: "prototype", label: "Build a prototype", done: false },
  ],
};

const { agent } = useAgent({
  updates: [UseAgentUpdate.OnStateChanged],
});
const state = computed(() => (agent.value?.state ?? {}) as Partial<CanvasState>);

watchEffect(() => {
  const currentAgent = agent.value;
  if (!currentAgent) return;

  const current = (currentAgent.state ?? {}) as Partial<CanvasState>;
  const updates: Partial<CanvasState> = {};
  if (current.title === undefined) updates.title = initialState.title;
  if (current.items === undefined) updates.items = initialState.items;

  if (Object.keys(updates).length > 0) {
    currentAgent.setState({ ...current, ...updates });
  }
});

function toggleItem(id: string) {
  const currentAgent = agent.value;
  if (!currentAgent) return;

  const current = (currentAgent.state ?? {}) as Partial<CanvasState>;
  currentAgent.setState({
    ...current,
    items: (current.items ?? []).map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
  });
}
</script>

<template>
  <main class="canvas">
    <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">{{ state.title ?? "Untitled" }}</h1>
    <ul class="mt-4 space-y-2">
      <li
        v-for="item in state.items ?? []"
        :key="item.id"
        :data-done="item.done"
        class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
        @click="toggleItem(item.id)"
      >
        <span>{{ item.done ? "☑" : "☐" }}</span>
        <span :class="item.done ? 'text-slate-400 line-through' : ''">{{ item.label }}</span>
      </li>
    </ul>
  </main>
</template>
