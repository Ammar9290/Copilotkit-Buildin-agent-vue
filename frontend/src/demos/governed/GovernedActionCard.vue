<script setup lang="ts">
// Verbatim structure of the doc's GovernedActionCard.vue.
import { computed, ref, watchEffect } from "vue";

const props = defineProps<{
  args: {
    id?: string;
    summary?: string;
    reference?: string;
    verdict?: "allow" | "deny" | "require_approval";
  };
  respond?: (result: unknown) => Promise<void>;
}>();

const submitted = ref(false);
const ready = computed(() => Boolean(props.respond && props.args.id && props.args.reference && props.args.verdict));

function submitDecision(approved: boolean) {
  if (!ready.value || submitted.value || !props.respond) return;
  if (approved && props.args.verdict === "deny") return;
  submitted.value = true;
  void props.respond({
    approved,
    actionId: props.args.id,
    reference: props.args.reference,
  });
}

watchEffect(() => {
  if (props.args.verdict === "allow") submitDecision(true);
  if (props.args.verdict === "deny") submitDecision(false);
});
</script>

<template>
  <section class="governed-action-card my-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/40">
    <p v-if="props.args.verdict === 'allow'">Allowed by policy</p>
    <p v-else-if="props.args.verdict === 'deny'">Blocked by policy</p>
    <p class="font-medium">{{ props.args.summary ?? "Preparing approval…" }}</p>
    <div v-if="ready && !submitted && props.args.verdict === 'require_approval'" class="row mt-2">
      <button type="button" class="btn-primary" @click="submitDecision(true)">Approve and run</button>
      <button type="button" class="btn" @click="submitDecision(false)">Reject</button>
    </div>
    <p v-if="submitted" class="muted mt-1">Decision sent.</p>
  </section>
</template>
