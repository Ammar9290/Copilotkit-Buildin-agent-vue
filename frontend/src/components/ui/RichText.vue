<script setup lang="ts">
/**
 * Renders plain prose with `backtick` spans as <code>. Notes live as plain
 * strings in route-notes.ts; this keeps them readable without HTML in data.
 */
import { computed } from "vue";

const props = defineProps<{ text: string }>();
const parts = computed(() =>
  props.text.split(/(`[^`]+`)/g).map((p) =>
    p.startsWith("`") && p.endsWith("`") && p.length > 1 ? { code: true, v: p.slice(1, -1) } : { code: false, v: p },
  ),
);
</script>

<template>
  <template v-for="(p, i) in parts" :key="i"><code v-if="p.code">{{ p.v }}</code><template v-else>{{ p.v }}</template></template>
</template>
