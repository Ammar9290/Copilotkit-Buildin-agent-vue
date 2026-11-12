<script setup lang="ts">
// The doc's "Connecting to an AG-UI agent directly": a CopilotKitProvider with
// agents__unsafe_dev_only and an HttpAgent. The HttpAgent targets this suite's
// own AG-UI endpoint for `router-custom` (scripted, needs no model key).
// It is a second, nested provider, isolated on purpose.
import { HttpAgent } from "@ag-ui/client";
import { CopilotChat, CopilotKitProvider } from "@copilotkit/vue/v2";
import { RUNTIME_URL } from "@/config";

const myAgent = new HttpAgent({
  url: `${RUNTIME_URL}/agent/router-custom/run`,
});
</script>

<template>
  <section class="panel flex min-h-0 flex-col">
    <h3>Direct AG-UI connection</h3>
    <p class="muted text-xs">HttpAgent → <code>{{ RUNTIME_URL }}/agent/router-custom/run</code></p>
    <CopilotKitProvider :agents__unsafe_dev_only="{ 'my-agent': myAgent }">
      <div class="mt-2 min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <CopilotChat agent-id="my-agent" />
      </div>
    </CopilotKitProvider>
  </section>
</template>
