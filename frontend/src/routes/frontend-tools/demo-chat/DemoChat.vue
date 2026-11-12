<script setup lang="ts">
/** Frontend Tools: the doc's DashboardAgent, with a visible incident list. */
import DemoFrame from "@/components/DemoFrame.vue";
import DashboardAgent from "@/demos/frontend-tools/DashboardAgent.vue";
</script>

<template>
  <DemoFrame parent-path="/frontend-tools" subtitle="useFrontendTool(filter_incidents) · agent default">
    <DashboardAgent />
  </DemoFrame>
</template>
