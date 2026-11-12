<script setup lang="ts">
/**
 * Root: one CopilotKitProvider pointed at the local runtime, so a demo route
 * continues the same agent state as the notes page it was opened from.
 *
 * `/…/demo-chat` routes render full-bleed with no sidebar or padding, so they
 * can be screen-recorded without the harness chrome in frame. Everything else
 * gets the sidebar layout.
 */
import { computed } from "vue";
import { useRoute } from "vue-router";
import { CopilotKitProvider } from "@copilotkit/vue/v2";
import { RUNTIME_URL, PUBLIC_LICENSE_KEY } from "./config";
import { captureError } from "./lib/errors";
import NavSidebar from "./components/NavSidebar.vue";

const route = useRoute();
const isDemo = computed(() => route.path.endsWith("/demo-chat"));
</script>

<template>
  <CopilotKitProvider :runtime-url="RUNTIME_URL" :public-license-key="PUBLIC_LICENSE_KEY" :on-error="captureError">
    <div v-if="isDemo" class="h-dvh overflow-hidden">
      <RouterView :key="route.path" />
    </div>
    <template v-else>
      <NavSidebar />
      <main class="lg:pl-72">
        <div class="mx-auto max-w-5xl space-y-6 px-5 py-10 lg:px-8">
          <RouterView :key="route.path" />
        </div>
      </main>
    </template>
  </CopilotKitProvider>
</template>
