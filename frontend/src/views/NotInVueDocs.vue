<script setup lang="ts">
import { computed } from "vue";
import { docUrl, findRoute, DOC_SYNC_DATE } from "@/lib/nav-config";
import RouteHeader from "@/components/RouteHeader.vue";
import Panel from "@/components/ui/Panel.vue";
import Callout from "@/components/ui/Callout.vue";
import KeyValue from "@/components/ui/KeyValue.vue";

const props = defineProps<{ path: string }>();
const route = computed(() => findRoute(props.path)!);
const rows = computed<[string, string, string?][]>(() => {
  const elsewhere = route.value.probe?.elsewhere;
  return [
    ["Probed URL", docUrl(route.value), docUrl(route.value)],
    ["Result", route.value.probe?.result ?? ""],
    ["Exists elsewhere", elsewhere ? `${elsewhere} (not Vue-specific)` : "—", elsewhere],
    ["Probed on", DOC_SYNC_DATE],
  ];
});
</script>

<template>
  <RouteHeader :path="path" />
  <Panel title="Not documented for Vue">
    <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      This item is on the requested checklist, but the Vue docs have no page for it. Nothing is implemented here,
      on purpose: the suite tests what the Vue docs document, and does not borrow another framework's page.
    </p>
    <div class="mt-4">
      <KeyValue :rows="rows" />
    </div>
  </Panel>
  <Callout tone="info" title="If it appears later">
    Re-run Step 0 from <code>CLAUDE.md</code>, add a demo under <code>src/routes{{ path }}/demo-chat/</code>, set
    <code>hasDemo</code> in nav-config, and register it with the autorecorder. <code>@copilotkit/vue@1.87.0</code> already
    exports related primitives (e.g. <code>A2UIMessageRenderer</code>, <code>vueBasicCatalog</code>,
    <code>OpenGenerativeUIRenderer</code>), but without a Vue doc page there is no documented contract to test.
  </Callout>
</template>
