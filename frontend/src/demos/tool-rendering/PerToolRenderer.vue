<script setup lang="ts">
import { z } from "zod";
import { CopilotChat, useDefaultRenderTool, useRenderTool } from "@copilotkit/vue/v2";
import WeatherToolCard from "./WeatherToolCard.vue";

useRenderTool({
  name: "get_weather",
  parameters: z.object({ city: z.string() }),
  render: WeatherToolCard as never, // doc component only declares the props it uses; see Known issues
});

useDefaultRenderTool(); // wildcard fallback for every other tool
</script>

<template><CopilotChat /></template>
