<script setup lang="ts">
// The doc's ThreadControls.vue + "create a thread with your own API".
import { useCopilotChatConfiguration } from "@copilotkit/vue/v2";
import { myApi } from "./myApi";

const { existingId } = defineProps<{ existingId: string }>();
const config = useCopilotChatConfiguration();

async function startConversation() {
  const { id } = await myApi.createThread();
  config.value?.setActiveThreadId(id, { explicit: true });
}
</script>

<template>
  <div class="row">
    <button type="button" class="btn" @click="config?.setActiveThreadId(existingId, { explicit: true })">Open conversation</button>
    <button type="button" class="btn" @click="config?.startNewThread()">New chat</button>
    <button type="button" class="btn" @click="startConversation">New via myApi</button>
  </div>
  <p class="muted mt-1 text-xs">active: <code>{{ config?.threadId }}</code></p>
</template>
