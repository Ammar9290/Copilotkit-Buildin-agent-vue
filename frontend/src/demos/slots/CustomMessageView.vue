<script setup lang="ts">
// The doc's "Custom Components" sample: a fully owned message view. Once the
// whole slot is replaced, this component owns rendering, so only text appears.
defineProps<{
  messages: { id: string; role: string; content?: unknown }[];
  isRunning: boolean;
}>();

function text(content: unknown): string {
  if (typeof content === "string") return content;
  if (content == null) return "";
  return JSON.stringify(content);
}
</script>

<template>
  <div class="h-full space-y-2 overflow-auto p-6">
    <div
      v-for="m in messages"
      :key="m.id"
      :data-role="m.role"
      class="custom-message rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
    >
      <code>[{{ m.role }}]</code> {{ text(m.content) }}
    </div>
    <p v-if="isRunning" class="muted text-sm">…streaming</p>
    <p v-if="!messages.length" class="muted text-sm">CustomMessageView: no messages yet.</p>
  </div>
</template>
