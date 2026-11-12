<script setup lang="ts">
import { useCopilotChatConfiguration } from "@copilotkit/vue/v2";

const configuration = useCopilotChatConfiguration();

function startNewConversation() {
  configuration.value?.startNewThread();
}
</script>

<template>
  <div class="row text-xs">
    <button type="button" class="btn" @click="startNewConversation">New conversation</button>
    <span class="muted">active threadId: <code>{{ configuration?.threadId ?? "(no configuration)" }}</code></span>
  </div>
</template>
