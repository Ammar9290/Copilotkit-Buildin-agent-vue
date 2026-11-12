<script setup lang="ts">
// The doc's WorkspaceContext.vue, plus a selector to change the value.
import { ref } from "vue";
import { useAgentContext } from "@copilotkit/vue/v2";

const workspaceId = ref("northstar");

useAgentContext({
  description: "Active workspace",
  value: workspaceId,
});
</script>

<template>
  <p class="text-sm">Workspace: <strong data-testid="workspace-id">{{ workspaceId }}</strong></p>
  <select v-model="workspaceId" class="field mt-2" aria-label="Workspace" data-testid="workspace-select">
    <option>northstar</option>
    <option>southwind</option>
    <option>eastgate</option>
  </select>
</template>
