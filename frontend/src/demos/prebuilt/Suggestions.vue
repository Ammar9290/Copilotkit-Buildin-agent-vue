<script setup lang="ts">
// Starter suggestions: `useConfigureSuggestions` called in a child of
// CopilotKitProvider; the nearest chat surface picks them up.
import { useConfigureSuggestions } from "@copilotkit/vue/v2";

useConfigureSuggestions({
  suggestions: [
    { title: "What can you do?", message: "What can you do?" },
    { title: "Weather in Paris", message: "What's the weather in Paris?" },
  ],
});
</script>

<template><span hidden /></template>
