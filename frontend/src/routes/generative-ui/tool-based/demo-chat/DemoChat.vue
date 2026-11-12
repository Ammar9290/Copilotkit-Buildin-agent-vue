<script setup lang="ts">
/** Components as Tools: the doc's AgentExperience (useComponent → WeatherCard). */
import DemoFrame from "@/components/DemoFrame.vue";
import AgentExperience from "@/demos/component-tool/AgentExperience.vue";
</script>

<template>
  <DemoFrame parent-path="/generative-ui/tool-based" subtitle="useComponent(show_weather) · agent default">
    <div class="h-full"><AgentExperience /></div>
  </DemoFrame>
</template>
