<script setup lang="ts">
/** Notes & source for one demo route, laid out like every other route. */
import { computed } from "vue";
import { NOTES } from "@/lib/route-notes";
import RouteHeader from "@/components/RouteHeader.vue";
import Panel from "@/components/ui/Panel.vue";
import TryIt from "@/components/ui/TryIt.vue";
import Callout from "@/components/ui/Callout.vue";
import RichText from "@/components/ui/RichText.vue";
import SourceCode from "@/components/ui/SourceCode.vue";

const props = defineProps<{ path: string }>();
const notes = computed(() => NOTES[props.path]);
</script>

<template>
  <RouteHeader :path="path" />

  <Callout v-if="!notes" tone="error" title="No notes registered">
    Add an entry for <code>{{ path }}</code> in <code>src/lib/route-notes.ts</code>.
  </Callout>

  <template v-else>
    <Panel title="What it demonstrates">
      <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300"><RichText :text="notes.demonstrates" /></p>
      <div class="mt-4">
        <TryIt :prompts="notes.tryIt.prompts" :pass="notes.tryIt.pass" :fail="notes.tryIt.fail" />
      </div>
    </Panel>

    <Callout v-for="c in notes.callouts ?? []" :key="c.title" :tone="c.tone" :title="c.title">
      <RichText :text="c.body" />
    </Callout>

    <Panel title="The demo" description="Read from this repo, verbatim. The first file is the chrome-free page behind “Open demo”.">
      <SourceCode :files="notes.demoFiles" />
    </Panel>

    <Panel v-for="s in notes.sources ?? []" :key="s.title" :title="s.title" :description="s.description">
      <SourceCode :files="s.files" />
    </Panel>
  </template>
</template>
