<script setup lang="ts">
/**
 * Runtime HTTP endpoints: call each multi-route endpoint from the doc's table
 * and show the raw status and body.
 */
import { ref } from "vue";
import DemoFrame from "@/components/DemoFrame.vue";
import { RUNTIME_URL } from "@/config";

const threadId = ref("rt-endpoints-demo");
const out = ref<{ label: string; status: string; ok: boolean; body: string }[]>([]);

async function call(path: string, init?: RequestInit) {
  const label = `${init?.method ?? "GET"} ${path}`;
  const started = performance.now();
  try {
    const res = await fetch(`${RUNTIME_URL}${path}`, init);
    const ct = res.headers.get("content-type") ?? "";
    const text = await res.text();
    let body = text;
    if (ct.includes("json")) {
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        /* keep raw */
      }
    }
    out.value.unshift({
      label,
      ok: res.ok,
      status: `${res.status} · ${ct || "no content-type"} · ${Math.round(performance.now() - started)}ms`,
      body: body.length > 3000 ? `${body.slice(0, 3000)}\n…(truncated)` : body,
    });
  } catch (e) {
    out.value.unshift({ label, ok: false, status: "network error", body: (e as Error).message });
  }
}

const runBody = () =>
  JSON.stringify({
    threadId: threadId.value,
    runId: crypto.randomUUID(),
    messages: [{ id: crypto.randomUUID(), role: "user", content: "weather?" }],
    tools: [],
    context: [],
    state: {},
    forwardedProps: {},
  });
const json = { "content-type": "application/json" };
/** The doc says a stop body with any key other than runId is rejected with 400. */
const INVALID_STOP_BODY = JSON.stringify({ nope: 1 });

const BUTTONS: { label: string; go: () => Promise<void> }[] = [
  { label: "GET /info", go: () => call("/info") },
  { label: "POST /agent/router-custom/run", go: () => call("/agent/router-custom/run", { method: "POST", headers: json, body: runBody() }) },
  { label: "GET /threads/:id/messages", go: () => call(`/threads/${threadId.value}/messages`) },
  { label: "GET /threads/:id/events", go: () => call(`/threads/${threadId.value}/events`) },
  { label: "GET /threads/:id/state", go: () => call(`/threads/${threadId.value}/state`) },
  { label: "GET /threads", go: () => call("/threads") },
  { label: "POST /threads/clear", go: () => call("/threads/clear", { method: "POST" }) },
  { label: "POST stop (invalid body)", go: () => call(`/agent/router-custom/stop/${threadId.value}`, { method: "POST", headers: json, body: INVALID_STOP_BODY }) },
  { label: "GET /inspector-metadata", go: () => call("/inspector-metadata") },
];
</script>

<template>
  <DemoFrame parent-path="/backend/runtime-endpoints" subtitle="multi-route mode · raw responses">
    <div class="grid h-full grid-cols-[20rem_minmax(0,1fr)]">
      <aside class="space-y-2 border-r border-slate-200 p-4 dark:border-slate-800">
        <label class="block text-xs text-slate-500">threadId <input v-model="threadId" class="field mt-1 w-full" /></label>
        <button v-for="b in BUTTONS" :key="b.label" type="button" class="btn block w-full text-left font-mono text-xs" @click="b.go">
          {{ b.label }}
        </button>
        <button type="button" class="block text-xs text-slate-500 underline" @click="out = []">Clear output</button>
      </aside>
      <div class="min-h-0 space-y-3 overflow-auto p-4" data-testid="endpoint-output">
        <p v-if="!out.length" class="muted text-sm">Click an endpoint. Start with POST /agent/router-custom/run to create thread history.</p>
        <section v-for="(o, i) in out" :key="i" class="panel endpoint-result">
          <div class="flex items-center gap-2 text-sm">
            <strong class="font-mono">{{ o.label }}</strong>
            <span :class="['badge', o.ok ? 'border-emerald-300 text-emerald-700' : 'border-rose-300 text-rose-700']">{{ o.status }}</span>
          </div>
          <pre class="mt-2">{{ o.body }}</pre>
        </section>
      </div>
    </div>
  </DemoFrame>
</template>
