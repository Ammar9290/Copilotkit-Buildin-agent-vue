<script setup lang="ts">
/**
 * CopilotSidebar with `width`, `default-open` and a custom `header` slot.
 *
 * The doc says the header slot props include toggle/open/close. This header
 * prints the props it actually receives and offers both the documented
 * `close()` and the `onClose()` that 1.87.0 passes, so the gap stays visible.
 */
import { CopilotSidebar } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";

/** Reads a slot-prop function by name without assuming the doc's typing. */
function slotFn(props: object, name: string): (() => void) | undefined {
  const fn = (props as Record<string, unknown>)[name];
  return typeof fn === "function" ? (fn as () => void) : undefined;
}
</script>

<template>
  <DemoFrame parent-path="/prebuilt-components/sidebar" subtitle="width 420 · header slot · agent my-agent">
    <main class="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-50">Your App</h1>
      <p class="max-w-md text-sm text-slate-500">The sidebar docks at the right edge. Its header is a custom slot.</p>
    </main>
    <CopilotSidebar agent-id="my-agent" :default-open="true" :width="420">
      <template #header="headerProps">
        <div class="border-b border-slate-200 px-4 py-3 text-xs dark:border-slate-800" data-testid="sidebar-custom-header">
          <div class="flex items-center justify-between">
            <strong class="text-sm">Custom sidebar header</strong>
            <span class="muted">isOpen: {{ headerProps.isOpen }}</span>
          </div>
          <p class="muted mt-1">slot props received: <code>{{ Object.keys(headerProps).join(", ") }}</code></p>
          <div class="row mt-2">
            <button type="button" class="btn" :disabled="!slotFn(headerProps, 'close')" @click="slotFn(headerProps, 'close')?.()">
              close() (per doc)
            </button>
            <span v-if="!slotFn(headerProps, 'close')" class="text-rose-600">✗ close not provided</span>
            <button type="button" class="btn" @click="headerProps.onClose()">onClose() (actual)</button>
          </div>
        </div>
      </template>
    </CopilotSidebar>
  </DemoFrame>
</template>
