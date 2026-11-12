<script setup lang="ts">
// Verbatim structure of the doc's GovernedActionApproval.vue.
import { computed, watchEffect } from "vue";
import { useInterrupt } from "@copilotkit/vue/v2";

type GovernedAction = {
  id: string;
  summary: string;
  tool: string;
  reference: string;
  verdict: "allow" | "deny" | "require_approval";
  arguments: Record<string, unknown>;
};

const { slotProps } = useInterrupt({ renderInChat: false });
const action = computed(
  () =>
    (slotProps.value?.interrupt as { metadata?: { action?: unknown } } | null | undefined)?.metadata?.action as
      | GovernedAction
      | undefined,
);

async function approve(approved: boolean) {
  const current = action.value;
  if (!current || !slotProps.value) return;

  await slotProps.value.resolve({
    approved,
    actionId: current.id,
    reference: current.reference,
  });
}

watchEffect(() => {
  if (action.value?.verdict === "allow") void approve(true);
  if (action.value?.verdict === "deny") void slotProps.value?.cancel();
});
</script>

<template>
  <section v-if="action" class="governed-approval-panel rounded-lg border border-amber-300 p-3 text-sm">
    <p>
      {{ action.verdict === "allow" ? "Allowed by policy" : action.verdict === "deny" ? "Blocked by policy" : "User approval required" }}
    </p>
    <h3>{{ action.summary }}</h3>
    <p>Tool: {{ action.tool }}</p>
    <p>Reference: {{ action.reference }}</p>
    <pre>{{ JSON.stringify(action.arguments, null, 2) }}</pre>
    <div v-if="action.verdict === 'require_approval'" class="row">
      <button type="button" class="btn-primary" @click="approve(true)">Approve and run</button>
      <button type="button" class="btn" @click="approve(false)">Reject</button>
    </div>
  </section>
</template>
