<script setup lang="ts">
/**
 * The one code block in the app. SourceCode (files from the repo) renders
 * through it, so caption, scrolling and highlighting are identical everywhere.
 */
import { ref, watchEffect } from "vue";
import { highlight } from "../../lib/highlight";

const props = withDefaults(
  defineProps<{
    code: string;
    caption?: string;
    language?: string;
    note?: string;
    /** "block" caps height and scrolls both ways; "inline" only scrolls horizontally. */
    scroll?: "block" | "inline";
  }>(),
  { scroll: "block" },
);

const html = ref<string | null>(null);
watchEffect(async () => {
  html.value = props.language ? await highlight(props.code, props.language) : null;
});
</script>

<template>
  <figure class="code-figure overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
    <figcaption
      v-if="caption || language"
      class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-2 font-mono text-xs text-slate-400"
    >
      <span class="min-w-0 break-all">{{ caption }}</span>
      <span v-if="language" class="shrink-0 uppercase">{{ language }}</span>
    </figcaption>
    <p v-if="note" class="border-b border-amber-900 bg-amber-950/40 px-4 py-2 text-xs text-amber-200">{{ note }}</p>
    <!-- Shiki escapes the code; the input is this repo's own files. -->
    <div v-if="html" :class="scroll === 'block' ? 'max-h-[36rem] overflow-auto' : 'overflow-x-auto'" v-html="html" />
    <pre
      v-else
      :class="[scroll === 'block' ? 'max-h-[36rem] overflow-auto' : 'overflow-x-auto', 'p-4 text-xs leading-relaxed text-slate-100']"
    ><code>{{ code }}</code></pre>
  </figure>
</template>
