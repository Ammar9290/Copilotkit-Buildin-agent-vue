<script setup lang="ts">
/**
 * Slots (Subcomponents): each tab applies one sample from the doc to a fresh
 * CopilotChat (agent `my-agent`), so the replaced piece can be checked alone.
 */
import { ref } from "vue";
import {
  CopilotChat,
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatMessageView,
  type CopilotChatLabels,
} from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import CustomMessageView from "@/demos/slots/CustomMessageView.vue";

const TABS = [
  "Welcome screen",
  "Assistant message",
  "Disclaimer",
  "Props override",
  "Custom component",
  "Nested: 2 levels",
  "Nested: 3 levels",
  "Labels",
] as const;
type Tab = (typeof TABS)[number];
const tab = ref<Tab>("Welcome screen");
const starred = ref(0);

// See the CopilotChat demo: labels are typed as the literal defaults in 1.87.0.
const labels = {
  chatInputPlaceholder: "Ask your agent anything…",
  welcomeMessageText: "Custom welcome text from the labels prop.",
  chatDisclaimerText: "AI responses may be inaccurate.",
} as unknown as Partial<CopilotChatLabels>;
</script>

<template>
  <DemoFrame parent-path="/custom-look-and-feel/slots" subtitle="named + scoped slots · agent my-agent">
    <div class="flex h-full flex-col">
      <div class="flex shrink-0 flex-wrap gap-1 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <button v-for="t in TABS" :key="t" type="button" class="tab" :aria-pressed="tab === t" @click="tab = t">{{ t }}</button>
      </div>
      <div class="min-h-0 flex-1" :key="tab">
        <!-- welcome-screen slot -->
        <CopilotChat v-if="tab === 'Welcome screen'" agent-id="my-agent">
          <template #welcome-screen="{ onSubmitMessage }">
            <section class="mx-auto mt-24 max-w-sm rounded-xl border border-slate-200 p-6 text-center shadow-sm dark:border-slate-800" data-testid="custom-welcome">
              <h2 class="text-lg font-semibold">How can we help?</h2>
              <button type="button" class="btn-primary mt-4" @click="onSubmitMessage('Show my open tickets')">Show my open tickets</button>
            </section>
          </template>
        </CopilotChat>

        <!-- assistant-message slot -->
        <CopilotChat v-else-if="tab === 'Assistant message'" agent-id="my-agent">
          <template #message-view="{ messages, isRunning }">
            <CopilotChatMessageView :messages="messages" :is-running="isRunning">
              <template #assistant-message="{ message, messages: allMessages, isRunning: running }">
                <CopilotChatAssistantMessage :message="message" :messages="allMessages" :is-running="running">
                  <template #toolbar-items>
                    <span class="badge" data-status="working" data-testid="reviewed-badge">Reviewed</span>
                  </template>
                </CopilotChatAssistantMessage>
              </template>
            </CopilotChatMessageView>
          </template>
        </CopilotChat>

        <!-- input → disclaimer slot -->
        <CopilotChat v-else-if="tab === 'Disclaimer'" agent-id="my-agent">
          <template #input="inputProps">
            <CopilotChatInput v-bind="inputProps">
              <template #disclaimer>
                <p class="py-1 text-center text-xs font-medium text-amber-600" data-testid="custom-disclaimer">Responses may be inaccurate.</p>
              </template>
            </CopilotChatInput>
          </template>
        </CopilotChat>

        <!-- classes + props override on a public leaf -->
        <CopilotChat v-else-if="tab === 'Props override'" agent-id="my-agent">
          <template #message-view="slotProps">
            <CopilotChatMessageView
              v-bind="slotProps"
              class="my-custom-messages rounded-xl bg-slate-50 p-4 dark:bg-slate-900"
              data-testid="message-view"
            />
          </template>
        </CopilotChat>

        <!-- custom component owns the whole message view -->
        <CopilotChat v-else-if="tab === 'Custom component'" agent-id="my-agent">
          <template #message-view="{ messages, isRunning }">
            <CustomMessageView :messages="messages" :is-running="isRunning" />
          </template>
        </CopilotChat>

        <!-- two levels: assistant toolbar -->
        <CopilotChat v-else-if="tab === 'Nested: 2 levels'" agent-id="my-agent">
          <template #message-view="{ messages, isRunning }">
            <CopilotChatMessageView :messages="messages" :is-running="isRunning">
              <template #assistant-message="assistantProps">
                <CopilotChatAssistantMessage v-bind="assistantProps">
                  <template #toolbar-items>
                    <button type="button" class="btn" title="Custom toolbar action" data-testid="star-action" @click="starred++">⭐ {{ starred }}</button>
                  </template>
                </CopilotChatAssistantMessage>
              </template>
            </CopilotChatMessageView>
          </template>
        </CopilotChat>

        <!-- three levels: one toolbar button -->
        <CopilotChat v-else-if="tab === 'Nested: 3 levels'" agent-id="my-agent">
          <template #message-view="{ messages, isRunning }">
            <CopilotChatMessageView :messages="messages" :is-running="isRunning">
              <template #assistant-message="assistantProps">
                <CopilotChatAssistantMessage v-bind="assistantProps">
                  <template #copy-button="{ onCopy }">
                    <button type="button" class="btn" data-testid="copy-response" @click="onCopy">Copy response</button>
                  </template>
                </CopilotChatAssistantMessage>
              </template>
            </CopilotChatMessageView>
          </template>
        </CopilotChat>

        <!-- labels prop -->
        <CopilotChat v-else agent-id="my-agent" :labels="labels" />
      </div>
    </div>
  </DemoFrame>
</template>
