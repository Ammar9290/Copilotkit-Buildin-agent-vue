<script setup lang="ts">
/**
 * HITL Overview, pattern 1: useHumanInTheLoop (`schedule_meeting`). The doc
 * imports a TimePickerCard without showing it; the suite supplies one.
 */
import { CopilotChat } from "@copilotkit/vue/v2";
import DemoFrame from "@/components/DemoFrame.vue";
import MeetingApproval from "@/demos/hitl/MeetingApproval.vue";
</script>

<template>
  <DemoFrame parent-path="/human-in-the-loop" subtitle="useHumanInTheLoop(schedule_meeting) · agent default">
    <MeetingApproval />
    <div class="h-full"><CopilotChat /></div>
  </DemoFrame>
</template>
