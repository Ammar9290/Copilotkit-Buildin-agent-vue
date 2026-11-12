<script setup lang="ts">
/** Renders files from this repository verbatim. */
import { ref, watchEffect } from "vue";
import { readSource, type SourceFile } from "../../lib/source";
import CodeFigure from "./CodeFigure.vue";

const props = defineProps<{ files: string[]; note?: string }>();
const sources = ref<SourceFile[]>([]);

watchEffect(async () => {
  sources.value = await Promise.all(props.files.map((f) => readSource(f)));
});
</script>

<template>
  <div class="space-y-4">
    <CodeFigure
      v-for="s in sources"
      :key="s.path"
      :code="s.code"
      :caption="s.path"
      :language="s.language"
      :note="s.error"
    />
    <p v-if="note" class="text-sm text-slate-600 dark:text-slate-400">{{ note }}</p>
  </div>
</template>
