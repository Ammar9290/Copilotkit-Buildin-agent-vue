<script setup lang="ts">
// The doc's SharedWorkspace.vue: its "Reading agent state" and "Writing agent
// state" samples merged into one component, as the doc intends.
import { computed } from "vue";
import { useAgent, UseAgentUpdate } from "@copilotkit/vue/v2";

type WorkspaceState = {
  notes?: string[];
  preferences?: { tone?: string };
};

const { agent } = useAgent({
  agentId: "workspace",
  updates: [UseAgentUpdate.OnStateChanged],
});
const state = computed(() => (agent.value?.state ?? {}) as WorkspaceState);

function setTone(tone: string) {
  const current = agent.value;
  if (!current) return;

  const previous = (current.state ?? {}) as WorkspaceState;
  current.setState({
    ...previous,
    preferences: { ...previous.preferences, tone },
  });
}
</script>

<template>
  <ul class="list-disc space-y-1 pl-5 text-sm" data-testid="workspace-notes">
    <li v-for="note in state.notes ?? []" :key="note">{{ note }}</li>
    <li v-if="!(state.notes ?? []).length" class="muted list-none">No notes yet.</li>
  </ul>
  <p class="mt-3 text-sm">Tone: <strong data-testid="workspace-tone">{{ state.preferences?.tone ?? "(unset)" }}</strong></p>
  <div class="row mt-2">
    <button type="button" class="btn" @click="setTone('concise')">Prefer concise answers</button>
    <button type="button" class="btn" @click="setTone('detailed')">Prefer detailed answers</button>
  </div>
</template>
