<script setup lang="ts">
/**
 * Troubleshooting: reference material from the Vue troubleshooting pages,
 * mapped to this repo's actual symptoms, plus every doc-vs-package
 * discrepancy found while building the suite (left unfixed on purpose).
 */
import { DOCS_ROOT } from "@/lib/nav-config";
import { DISCREPANCIES, ISSUES } from "@/lib/troubleshooting";
import RouteHeader from "@/components/RouteHeader.vue";
import Panel from "@/components/ui/Panel.vue";
</script>

<template>
  <RouteHeader path="/troubleshooting" />

  <Panel title="Common issues in this repo" description="From the Vue Common Issues, Debug Mode and Event Inspector pages, translated to this repo.">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
            <th class="pb-2 pr-4 font-medium">Symptom</th>
            <th class="pb-2 pr-4 font-medium">Fix</th>
            <th class="pb-2 font-medium">Source</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="i in ISSUES" :key="i.symptom" class="align-top">
            <td class="py-2 pr-4 font-medium text-slate-800 dark:text-slate-200">{{ i.symptom }}</td>
            <td class="py-2 pr-4 text-slate-600 dark:text-slate-400">{{ i.fix }}</td>
            <td class="py-2">
              <a :href="`${DOCS_ROOT}/${i.source}`" target="_blank" rel="noreferrer" class="font-mono text-xs underline underline-offset-4">{{ i.source }}</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Panel>

  <Panel title="Doc vs. implementation discrepancies" description="None is worked around in the library; the demos show the actual behaviour.">
    <ul class="divide-y divide-slate-100 text-sm dark:divide-slate-800">
      <li v-for="d in DISCREPANCIES" :key="d.issue" class="py-3">
        <a :href="`${DOCS_ROOT}/${d.page.split(' ')[0]}`" target="_blank" rel="noreferrer" class="font-mono text-xs text-[var(--accent)] underline underline-offset-4">{{ d.page }}</a>
        <p class="mt-1 text-slate-700 dark:text-slate-300">{{ d.issue }}</p>
      </li>
    </ul>
  </Panel>
</template>
