<script setup lang="ts">
/**
 * Open, close, and feedback: a custom `toggle-button` scoped slot on
 * CopilotPopup, and thumbs feedback events through CopilotChatMessageView /
 * CopilotChatAssistantMessage. The doc calls a global `analytics.track(...)`;
 * here `analytics` writes to an on-page list so the events are visible.
 */
import { ref } from "vue";
import { CopilotChat, CopilotChatAssistantMessage, CopilotChatMessageView, CopilotPopup } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";

const tracked = ref<string[]>([]);
const analytics = {
  track: (name: string, data: unknown) => {
    tracked.value = [`${name} ${JSON.stringify(data)}`, ...tracked.value];
  },
};

function recordFeedback(message: { id: string }, value: "up" | "down") {
  analytics.track("feedback", { messageId: message.id, value });
}
</script>

<template>
  <DemoFrame parent-path="/prebuilt-components/chat-controls" subtitle="toggle-button slot · thumbs feedback">
    <div class="grid h-full grid-cols-[minmax(0,1fr)_22rem]">
      <CopilotChat agent-id="my-agent">
        <template #message-view="{ messages, isRunning }">
          <CopilotChatMessageView :messages="messages" :is-running="isRunning">
            <template #assistant-message="{ message, messages: allMessages, isRunning: running }">
              <CopilotChatAssistantMessage
                :message="message"
                :messages="allMessages"
                :is-running="running"
                @thumbs-up="recordFeedback($event, 'up')"
                @thumbs-down="recordFeedback($event, 'down')"
              />
            </template>
          </CopilotChatMessageView>
        </template>
      </CopilotChat>
      <aside class="flex min-h-0 flex-col border-l border-slate-200 p-4 dark:border-slate-800">
        <h3 class="text-sm font-semibold">analytics.track(...)</h3>
        <div class="event-log mt-2 min-h-0 flex-1" data-testid="feedback-log">
          <div v-if="!tracked.length" class="muted">No feedback yet.</div>
          <div v-for="(t, i) in tracked" :key="i">{{ t }}</div>
        </div>
      </aside>
    </div>
    <CopilotPopup agent-id="my-agent" :default-open="false">
      <template #toggle-button="{ isOpen, toggle }">
        <button
          type="button"
          class="btn-primary fixed bottom-16 left-6 z-50 rounded-full px-5 py-2.5"
          data-testid="custom-toggle"
          @click="toggle"
        >
          {{ isOpen ? "Close chat" : "Ask the assistant" }}
        </button>
      </template>
    </CopilotPopup>
  </DemoFrame>
</template>
