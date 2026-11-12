<script setup lang="ts">
// The doc's "complete example": custom bubble chrome around the public
// CopilotChatMessageView leaves, which keep tool/reasoning/activity rendering.
import { computed } from "vue";
import {
  CopilotChatAssistantMessage,
  CopilotChatMessageView,
  CopilotChatUserMessage,
  useAgent,
} from "@copilotkit/vue/v2";

const { agent } = useAgent({ agentId: "my-agent" });
const messages = computed(() => agent.value?.messages ?? []);
const isRunning = computed(() => agent.value?.isRunning ?? false);
</script>

<template>
  <p v-if="!messages.length" class="muted">
    No messages on <code>my-agent</code> yet. Send one from the Minimal tab, then come back.
  </p>
  <CopilotChatMessageView :messages="messages" :is-running="isRunning">
    <template #assistant-message="assistantProps">
      <article style="border-left: 3px solid var(--accent); padding-left: 10px; margin: 8px 0">
        <CopilotChatAssistantMessage v-bind="assistantProps" />
      </article>
    </template>
    <template #user-message="userProps">
      <article style="border-left: 3px solid #12b76a; padding-left: 10px; margin: 8px 0">
        <CopilotChatUserMessage v-bind="userProps" />
      </article>
    </template>
  </CopilotChatMessageView>
</template>
