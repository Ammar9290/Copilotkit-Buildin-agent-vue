<script setup lang="ts">
import { CopilotChat, useDefaultRenderTool } from "@copilotkit/vue/v2";
import BrandedToolCard from "./BrandedToolCard.vue";

useDefaultRenderTool({ render: BrandedToolCard as never }); // see Known issues: render component typing
</script>

<template><CopilotChat /></template>
