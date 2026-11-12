/** Troubleshooting data: common issues in this repo, and doc-vs-package discrepancies (left unfixed). */

export const ISSUES: { symptom: string; fix: string; source: string }[] = [
  { symptom: "A chat's explicit thread-id is ignored (runs go to a random thread)", fix: "Two chats on one page share an agent instance per agent-id. A CopilotChatConfigurationProvider for the same agent-id sets that instance's thread, overriding the other chat's thread-id. Give each a different agent-id (the Thread Lifecycle demo does).", source: "vue/threads-lifecycle" },
  {
    symptom: "Chat renders unstyled",
    fix: "@copilotkit/vue/styles.css must be imported once in the entry. It is imported in src/main.ts.",
    source: "vue",
  },
  {
    symptom: "No response, or 'Network error' in the chat",
    fix: "Start the backend (cd backend && npm run dev) and open http://localhost:8200/api/copilotkit/info. If localhost fails on your machine, try 127.0.0.1 in VITE_RUNTIME_URL.",
    source: "vue/troubleshooting/common-issues",
  },
  {
    symptom: "CORS error in the browser console",
    fix: "Vite (5173) and the runtime (8200) are different origins. backend/server.ts keeps cors: true. Set an explicit origin before deploying.",
    source: "vue",
  },
  {
    symptom: "RUN_ERROR: 'OpenAI API key is missing'",
    fix: "Set OPENAI_API_KEY in backend/.env, or in the shell that runs the backend. Pages using router-custom work without it.",
    source: "vue",
  },
  {
    symptom: "Built-in agent replies with an empty message",
    fix: "Check that COPILOT_MODEL is a supported provider/model string (openai:…, anthropic:…, google:…), and that a frontend tool handler isn't throwing.",
    source: "vue/troubleshooting/common-issues",
  },
  {
    symptom: "Connect route returns 404 on a fresh thread",
    fix: "The agent-id is not registered in backend/agents/index.ts, or connect ran before the first run. Check /info for the exact keys.",
    source: "vue/troubleshooting/common-issues",
  },
  {
    symptom: "Runtime memory keeps growing",
    fix: "InMemoryAgentRunner limits are set in server.ts (maxThreads 200 / maxRunsPerThread 50 / maxBytes 128 MiB). Lower them if needed.",
    source: "vue/troubleshooting/common-issues",
  },
  {
    symptom: "Need to see the server-side AG-UI pipeline",
    fix: "Start the backend with COPILOT_DEBUG=true (or verbose, which includes full payloads and may contain PII). Client side, use the Inspector or the AG-UI page's event log.",
    source: "vue/troubleshooting/debug-mode",
  },
];
export const DISCREPANCIES: { page: string; issue: string }[] = [
  { page: "vue/custom-look-and-feel/slots", issue: "The disclaimer-slot sample (`#input` → `<CopilotChatInput v-bind=\"inputProps\">` → `#disclaimer`) never renders: CopilotChatInput only renders its disclaimer when `showDisclaimer` is true, and the input slot props do not include it. Neither the custom nor the default disclaimer appears. Verified by the autorecorder." },
  { page: "vue/backend/runtime-endpoints", issue: "The doc says GET /threads works without Intelligence (agentId optional) and POST /threads/clear 'always answers 204'. In 1.87.0, both return 403 thread_access_not_configured unless identifyUser or threads: { access: 'open' } is set. Left as is." },
  { page: "vue/prebuilt-components/copilot-threads-drawer", issue: "The doc says the drawer shows a locked view without a valid Threads license. In 1.87.0, with no public-license-key and no Intelligence, it stays on 'Loading threads…' indefinitely and never sends a threads request." },
  { page: "vue/prebuilt-components/chat-controls", issue: "The toggle-button sample sets no :default-open, and CopilotPopup then starts open. That's not wrong, but it's easy to misread the sample as starting closed." },
  { page: "vue (quickstart)", issue: "When a run fails (e.g. a missing model key), CopilotChat shows nothing: the user message just sits there. The error only reaches onError and the Inspector's red launcher." },
  { page: "vue/prebuilt-components/sidebar", issue: "The doc says the header slot props include toggle/open/close. The actual CopilotSidebarViewHeaderSlotProps is { title, onClose, isOpen }. The sidebar page shows both." },
  { page: "vue/custom-look-and-feel/slots", issue: "`labels` is typed as Partial<typeof CopilotChatDefaultLabels>, i.e. the literal default strings, so any custom label is a TypeScript error. It works at runtime. The suite casts." },
  { page: "vue/generative-ui/tool-rendering", issue: "Render components that declare only the props they use (WeatherToolCard, GovernedActionCard, and TimePickerCard on the HITL page) aren't assignable to the render type of useRenderTool / useDefaultRenderTool / useHumanInTheLoop: vue-tsc reports missing name/toolCallId/... props. They work at runtime. The suite casts at the registration call." },
  { page: "vue/human-in-the-loop/governed-actions", issue: "The useInterrupt sample reads interrupt.metadata.action. BuiltInAgent interrupt tools emit { id, toolCallId, reason, message } with no metadata, so the approval panel never renders with the built-in agent." },
  { page: "vue (quickstart)", issue: "The quickstart uses model 'openai:gpt-6-luna' (colon), but the BuiltInAgentModel type and error messages use 'openai/gpt-6-luna' (slash). Both parse." },
  { page: "vue/backend/custom-agent", issue: "Its samples import createCopilotRuntimeHandler but call createCopilotEndpoint. Both are exported in 1.87.0, so the samples work, but the import list is inconsistent." },
  { page: "vue/multi-agent/subagents", issue: "The 'Rendering a live delegation log' section is empty for Vue, and the backend sample is Python/LangGraph only." },
  { page: "vue/shared-state", issue: "The 'Streaming partial state updates' sample is Python/LangGraph only. There is no Vue/built-in-agent equivalent." },
  { page: "vue/backend/ag-ui", issue: "The code blocks for resolving an agent, subscribing, and the proxy pattern are empty for Vue. Only the callback table remains." },
  { page: "vue/troubleshooting/common-issues", issue: "The section 'Tools I registered don't show up' is empty." },
  { page: "vue/threads", issue: "/vue/threads permanently redirects (308) to /vue/AG-UI-Streams. There is no 'Threads' landing page." },
];
