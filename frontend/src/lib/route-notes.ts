/**
 * Notes for each demo route: what it demonstrates, what to try, which of this
 * repo's files to show, and the doc-vs-package notes found while building it.
 *
 * RouteNotes.vue renders these under the RouteHeader, in the same order on
 * every page: What it demonstrates (+ Try it) → The demo → source panels →
 * callouts. File paths are repo-relative (see lib/source.ts).
 */

export interface SourcePanel {
  title: string;
  description?: string;
  files: string[];
}

export interface NoteCallout {
  tone: "info" | "warn" | "premium" | "success" | "error";
  title: string;
  body: string;
}

export interface RouteNotes {
  demonstrates: string;
  tryIt: { prompts: string[]; pass: string; fail?: string };
  /** Shown as "The demo": the demo-chat file plus the doc components it uses. */
  demoFiles: string[];
  sources?: SourcePanel[];
  callouts?: NoteCallout[];
}

const demo = (path: string) => `frontend/src/routes${path}/demo-chat/DemoChat.vue`;
const D = "frontend/src/demos";
const AGENTS: SourcePanel = {
  title: "The agent behind it",
  description: "Every agent id the frontend uses is registered on the runtime here.",
  files: ["backend/agents/index.ts"],
};
const KEY_FAIL = "No reply, plus a red error box on the notes page: the runtime has no model key (`RUN_ERROR: OpenAI API key is missing`), or it is not running.";

export const NOTES: Record<string, RouteNotes> = {
  "/quickstart": {
    demonstrates:
      "The shortest path from the Vue quickstart: a Node server hosts `CopilotRuntime` at `/api/copilotkit` with `cors: true` and a `default` `BuiltInAgent`; the Vue app imports `@copilotkit/vue/styles.css` once, wraps everything in `CopilotKitProvider runtime-url=…`, and renders `CopilotChat` with no agent-id, so it resolves to `default`.",
    tryIt: {
      prompts: ["Can you tell me a joke?", "What can you do?"],
      pass: "Tokens stream in and the reply renders as markdown. The Inspector button sits in a corner; its Agents tab lists `default`.",
      fail: KEY_FAIL,
    },
    demoFiles: [demo("/quickstart")],
    sources: [
      {
        title: "The runtime (server.ts)",
        description: "Same shape as the quickstart's server.ts: `createCopilotNodeListener` on port 8200, `basePath: \"/api/copilotkit\"`, `cors: true`.",
        files: ["backend/server.ts"],
      },
      {
        title: "Provider and entry",
        description: "The quickstart's App.vue / main.ts split: styles imported in the entry, the provider at the root.",
        files: ["frontend/src/App.vue", "frontend/src/main.ts", "frontend/src/config.ts"],
      },
      { title: "Installed versions", files: ["frontend/package.json", "backend/package.json"] },
    ],
    callouts: [
      {
        tone: "info",
        title: "Where this runtime differs from the quickstart's, and why",
        body: "The `agents` record holds more than `default`, because other doc pages use other agent ids (`my-agent`, `sales`, `workspace`, …) and constructor config that cannot share one instance. `default` keeps the quickstart prompt, plus mock tools used by the Tool Rendering and HITL pages.",
      },
    ],
  },

  "/prebuilt-components": {
    demonstrates:
      "`@copilotkit/vue/v2` ships three chat surfaces sharing one set of chat primitives. Each tab mounts one of them against `agent-id=\"my-agent\"`, and `useConfigureSuggestions` (called in a child of the provider) feeds starter pills to the nearest chat.",
    tryIt: {
      prompts: ["What can you do?", "Now give me one fun fact about the ocean."],
      pass: "CopilotChat fills the frame; CopilotSidebar docks right; CopilotPopup floats bottom-right. All three continue the same conversation, because they share the agent.",
      fail: KEY_FAIL,
    },
    demoFiles: [demo("/prebuilt-components"), `${D}/prebuilt/Suggestions.vue`],
    callouts: [
      {
        tone: "info",
        title: "Recording deviation",
        body: "The demo opens the sidebar and popup with `:default-open=\"true\"` so they are visible on video; the doc samples use `false`.",
      },
    ],
  },

  "/prebuilt-components/chat": {
    demonstrates:
      "`CopilotChat` with the props and events from the doc's table: `labels`, `auto-scroll`, `:on-error`, and the `@submit-message`, `@input-change`, `@select-suggestion` and `@stop` events, each written to a visible log.",
    tryIt: {
      prompts: ["Give me three tips for writing Vue composables."],
      pass: "The log shows `input-change` per keystroke, then `submit-message`. The placeholder and disclaimer use the custom labels.",
      fail: "Events missing from the log, or the default placeholder text.",
    },
    demoFiles: [demo("/prebuilt-components/chat")],
    callouts: [
      {
        tone: "warn",
        title: "Typing issue: labels",
        body: "`labels` is typed as `Partial<typeof CopilotChatDefaultLabels>`, i.e. the literal default strings, so any custom label is a vue-tsc error. It works at runtime; the demo casts.",
      },
    ],
  },

  "/prebuilt-components/sidebar": {
    demonstrates: "`CopilotSidebar` with `width` and `default-open`, and the `header` scoped slot replaced by a custom header that prints the slot props it actually receives.",
    tryIt: {
      prompts: ["Summarise what a sidebar copilot is good for."],
      pass: "A 420px panel docks right with the custom header. `onClose()` closes it.",
      fail: "The header shows `✗ close not provided`: that is the recorded doc discrepancy, not a harness bug.",
    },
    demoFiles: [demo("/prebuilt-components/sidebar")],
    callouts: [
      {
        tone: "warn",
        title: "Doc vs. package: header slot props",
        body: "The doc lists `toggle`, `open` and `close`. `CopilotSidebarViewHeaderSlotProps` in 1.87.0 is `{ title, onClose, isOpen }`. The `toggle-button` slot does match the doc.",
      },
    ],
  },

  "/prebuilt-components/popup": {
    demonstrates: "`CopilotPopup` sized with `width`/`height`, opened by default for the recording, and closable by clicking outside it.",
    tryIt: {
      prompts: ["Tell me a two-line poem about popups."],
      pass: "The overlay answers; clicking the page behind it closes it.",
      fail: KEY_FAIL,
    },
    demoFiles: [demo("/prebuilt-components/popup")],
  },

  "/prebuilt-components/chat-controls": {
    demonstrates:
      "Two controls from the doc: a custom launcher through the popup's `toggle-button` scoped slot (`isOpen`, `toggle`), and thumbs feedback by composing `CopilotChatMessageView` → `CopilotChatAssistantMessage` with `@thumbs-up` / `@thumbs-down`.",
    tryIt: {
      prompts: ["Give me a one-sentence productivity tip."],
      pass: "The custom button switches between 'Ask the assistant' and 'Close chat'. Clicking 👍 / 👎 on a reply adds a `feedback {messageId, value}` line.",
      fail: "Nothing is logged when rating a reply.",
    },
    demoFiles: [demo("/prebuilt-components/chat-controls")],
  },

  "/custom-look-and-feel/slots": {
    demonstrates:
      "Every slot sample on the page, one tab each: `welcome-screen`, the assistant `toolbar-items`, the input `disclaimer`, classes and props on a public leaf, a fully custom message view, and two- and three-level nesting down to one `copy-button`, plus `labels`.",
    tryIt: {
      prompts: ["Show my open tickets", "Can you tell me a joke?"],
      pass: "Each tab changes exactly the part it names: a custom welcome card, a 'Reviewed' badge, the props override, a custom message view, a ⭐ toolbar action, a 'Copy response' button, custom labels.",
      fail: "Recorded: the Disclaimer tab shows no disclaimer at all (see the callout). Anywhere else, the default UI where a slot should have replaced it.",
    },
    demoFiles: [demo("/custom-look-and-feel/slots"), `${D}/slots/CustomMessageView.vue`],
    callouts: [{ tone: "error", title: "Broken as documented: the disclaimer slot", body: "The doc's sample binds the `input` slot props onto `CopilotChatInput` and fills `#disclaimer`. CopilotChatInput renders that slot only when `showDisclaimer` is true, and the slot props do not include it, so nothing renders — not even the default disclaimer. The other seven samples work." }]
  },

  "/custom-look-and-feel/headless-ui": {
    demonstrates:
      "No CopilotChat shell. The minimal tab is the doc's HeadlessChat: `useAgent` for messages and run state, `agent.addMessage` + `copilotkit.runAgent` to send. The complete tab keeps custom bubble chrome around the public `CopilotChatMessageView` leaves.",
    tryIt: {
      prompts: ["What is the weather in Oslo?"],
      pass: "Minimal shows plain text only; the tool call is invisible by design. Complete shows the same conversation with the tool card.",
      fail: "Send does nothing, or no assistant row appears.",
    },
    demoFiles: [demo("/custom-look-and-feel/headless-ui"), `${D}/headless/HeadlessChat.vue`, `${D}/headless/RenderedMessages.vue`],
    callouts: [
      { tone: "info", title: "Vue has no useRenderToolCall", body: "As the doc notes, a fully manual Vue surface cannot resolve registered tool renderers; CopilotChatMessageView is the supported boundary." },
    ],
  },

  "/programmatic-control": {
    demonstrates:
      "Driving the `sales` agent without a chat: `agent.addMessage` then `copilotkit.runAgent({ agent: toRaw(agent) })`, `stopAgent` to cancel, and `agent.subscribe` for `onRunStartedEvent` / `onRunFinalized` / `onRunFailed`.",
    tryIt: {
      prompts: ["(click) Run agent"],
      pass: "The lifecycle log shows `started` then `done`; the agent calls `get_sales_data` and its two-sentence summary appears under Agent messages.",
      fail: "`failed: …` in the log.",
    },
    demoFiles: [demo("/programmatic-control"), `${D}/programmatic/AgentTrigger.vue`],
    sources: [AGENTS],
  },

  "/inspector": {
    demonstrates:
      "The Inspector overlay that CopilotKitProvider mounts in dev builds. The demo registers a frontend tool (`inspector_ping`) and agent context so the Frontend Tools and Context panes have entries.",
    tryIt: {
      prompts: ["Call inspector_ping twice, then tell me the count."],
      pass: "The ping counter reaches 2. In the Inspector: Agents lists every runtime agent, AG-UI Events fill during the run, Rich Threads is locked (no Intelligence).",
      fail: "No Inspector button in the corner in dev.",
    },
    demoFiles: [demo("/inspector")],
  },

  "/threads/drawer": {
    demonstrates:
      "`CopilotThreadsDrawer` beside `CopilotChat` under one `CopilotChatConfigurationProvider agent-id=\"support\"`, a toolbar `startNewThread()` button, the `#row` slot, and the controlled-threadId variant with `on-thread-select` / `on-new-thread`.",
    tryIt: {
      prompts: ["Hi, I need help with my order."],
      pass: "With a license and Intelligence: threads list, switch and replay. Without: the doc promises a locked view.",
      fail: "Recorded result without a license: the drawer stays on 'Loading threads…' indefinitely.",
    },
    demoFiles: [demo("/threads/drawer"), `${D}/threads/NewConversationButton.vue`, `${D}/threads/ControlledChat.vue`],
    callouts: [
      { tone: "premium", title: "Requires CopilotKit Intelligence", body: "Threads are stored server-side. Set `VITE_COPILOTKIT_PUBLIC_LICENSE_KEY` and an Intelligence-connected runtime to test the licensed path." },
    ],
  },

  "/threads/headless": {
    demonstrates: "The doc's ThreadSidebar over `useThreads({ agentId, limit: 20 })`: switch with `setActiveThreadId`, rename, archive, delete and paginate.",
    tryIt: {
      prompts: ["Start a thread about Vue reactivity."],
      pass: "With Intelligence: rows appear and sync. Without: the sidebar shows `Thread endpoints are not available on this CopilotKit runtime`.",
    },
    demoFiles: [demo("/threads/headless"), `${D}/threads/ThreadSidebar.vue`],
    callouts: [{ tone: "premium", title: "Requires CopilotKit Intelligence", body: "`useThreads` has no local backing store." }],
  },

  "/threads/lifecycle": {
    demonstrates:
      "Three lifecycle patterns: an explicit `thread-id` replayed from the runtime's in-memory runner on remount, `RestoreHistory` applying your own history with `agent.setMessages`, and `setActiveThreadId` / `startNewThread` from `useCopilotChatConfiguration`.",
    tryIt: {
      prompts: ["Remember the word 'lantern'.", "(click) Remount chat", "(click) Use #1's id"],
      pass: "After remount the conversation is replayed. Restore reports `restored N message(s)`.",
      fail: "Empty replay after a backend restart is expected: the runner is in-memory.",
    },
    demoFiles: [demo("/threads/lifecycle"), `${D}/threads/RestoreHistory.vue`, `${D}/threads/ThreadControls.vue`, `${D}/threads/myApi.ts`],
    callouts: [{ tone: "warn", title: "Gotcha: one agent instance per agent-id", body: "Panel 3 uses agent `support`. With `my-agent` there, its CopilotChatConfigurationProvider set the shared agent's thread and panel 1's explicit `thread-id` was silently ignored — runs went to a random thread and nothing replayed." }]
  },

  "/generative-ui/mcp-apps": {
    demonstrates: "The runtime's `mcpApps.servers` wiring; the MCP App renders inline in the chat in a sandboxed iframe, with no frontend renderer.",
    tryIt: {
      prompts: ["Draw a simple flowchart of a login process."],
      pass: "With `MCP_APPS_SERVER_URL=https://mcp.excalidraw.com/mcp`: the agent calls an MCP tool and the app's UI appears in the chat.",
      fail: "A text-only reply means the MCP server is not configured on the runtime.",
    },
    demoFiles: [demo("/generative-ui/mcp-apps")],
    sources: [{ title: "Runtime wiring", files: ["backend/server.ts"] }],
  },

  "/generative-ui/tool-rendering": {
    demonstrates:
      "The doc's three rendering modes, one tab each: per-tool `useRenderTool(get_weather)` with `useDefaultRenderTool()` as fallback, the zero-config default card, and a branded catch-all. The tools themselves are server tools on the `default` agent.",
    tryIt: {
      prompts: ["What is the weather in Tokyo, and roll a d20 for me."],
      pass: "Per-tool: a blue WeatherToolCard (\"Checking Tokyo\" → result) plus the default card for roll_d20. Catch-all: purple BrandedToolCards.",
      fail: "Raw tool JSON, or no card.",
    },
    demoFiles: [
      demo("/generative-ui/tool-rendering"),
      `${D}/tool-rendering/PerToolRenderer.vue`,
      `${D}/tool-rendering/WeatherToolCard.vue`,
      `${D}/tool-rendering/DefaultRenderer.vue`,
      `${D}/tool-rendering/CatchAllRenderer.vue`,
      `${D}/tool-rendering/BrandedToolCard.vue`,
    ],
    sources: [AGENTS],
    callouts: [
      { tone: "warn", title: "Typing issue: render components", body: "Components that declare only the props they use (the doc's WeatherToolCard) are not assignable to the `render` type; the demos cast at registration." },
    ],
  },

  "/generative-ui/tool-based": {
    demonstrates: "`useComponent` registers `WeatherCard` as the frontend tool `show_weather`; the agent fills its props and the card renders in the chat.",
    tryIt: {
      prompts: ["Show me the weather card for Berlin, 18 degrees, cloudy."],
      pass: "A WeatherCard (Berlin · 18° · cloudy) renders inline.",
      fail: "A text reply only.",
    },
    demoFiles: [demo("/generative-ui/tool-based"), `${D}/component-tool/AgentExperience.vue`, `${D}/component-tool/WeatherCard.vue`],
  },

  "/frontend-tools": {
    demonstrates: "`useFrontendTool` registers `filter_incidents`; its handler runs in the browser, changes a Vue ref, and returns a result to the agent.",
    tryIt: {
      prompts: ["Only show sev1 incidents.", "Show everything again."],
      pass: "'Current filter' changes to sev1 and the list narrows to two incidents, then back to all.",
      fail: "The filter does not change.",
    },
    demoFiles: [demo("/frontend-tools"), `${D}/frontend-tools/DashboardAgent.vue`],
  },

  "/shared-state": {
    demonstrates: "The doc's SharedWorkspace: read with `useAgent({ updates: [OnStateChanged] })`, write with `agent.setState`; the `workspace` agent edits the same state through the built-in state tools.",
    tryIt: {
      prompts: ["(click) Prefer concise answers", "Add a note: ship the Vue test suite.", "What tone do I prefer?"],
      pass: "Raw state shows `\"tone\": \"concise\"` at once; the agent's note appears in the list; it answers 'concise'.",
      fail: "Raw state does not change.",
    },
    demoFiles: [demo("/shared-state"), `${D}/shared-state/SharedWorkspace.vue`],
    sources: [AGENTS],
    callouts: [{ tone: "info", title: "Not covered", body: "The doc's token-by-token state streaming sample is Python/LangGraph only." }],
  },

  "/shared-state/rendering-in-app": {
    demonstrates: "The doc's Canvas: it seeds `title` and `items` into agent state on mount, renders them, and writes back with `toggleItem`. Both canvas and chat use the default agent.",
    tryIt: {
      prompts: ["Rename the project to Vue launch and add an item called Write README."],
      pass: "The canvas title and list update from the agent's state write.",
      fail: "The canvas shows 'Untitled'.",
    },
    demoFiles: [demo("/shared-state/rendering-in-app"), `${D}/shared-state/Canvas.vue`],
  },

  "/shared-state/agent-readonly": {
    demonstrates: "`useAgentContext({ description, value })` with a reactive ref: the agent can read the active workspace, never write it.",
    tryIt: {
      prompts: ["Which workspace am I in?"],
      pass: "It answers 'northstar', and follows the dropdown when it changes.",
      fail: "The agent does not know the workspace.",
    },
    demoFiles: [demo("/shared-state/agent-readonly"), `${D}/shared-state/WorkspaceContext.vue`],
  },

  "/human-in-the-loop": {
    demonstrates: "Pattern 1 from the overview: `useHumanInTheLoop(schedule_meeting)` renders TimePickerCard while the run waits, and `respond(...)` resumes it.",
    tryIt: {
      prompts: ["Schedule a meeting with Dana about the Q4 roadmap."],
      pass: "A card with time slots appears; picking one resumes the agent with your choice.",
      fail: "No card; the agent replies in text.",
    },
    demoFiles: [demo("/human-in-the-loop"), `${D}/hitl/MeetingApproval.vue`, `${D}/hitl/TimePickerCard.vue`],
  },

  "/human-in-the-loop/governed-actions": {
    demonstrates: "Both approval patterns from the doc: `useInterrupt` reading `interrupt.metadata.action`, and `useHumanInTheLoop(approve_governed_action)` with an approval card, plus the raw interrupt.",
    tryIt: {
      prompts: ["Use approve_governed_action to ask me before applying a 20% discount for ACME (reference POL-7, verdict require_approval)."],
      pass: "Pattern B: an amber approval card with Approve/Reject.",
      fail: "Pattern A's panel stays empty with this backend (see the callout).",
    },
    demoFiles: [
      demo("/human-in-the-loop/governed-actions"),
      `${D}/governed/GovernedActionApproval.vue`,
      `${D}/governed/GovernedActionTool.vue`,
      `${D}/governed/GovernedActionCard.vue`,
    ],
    callouts: [
      {
        tone: "error",
        title: "Broken with BuiltInAgent: useInterrupt pattern",
        body: "A `defineTool({ interrupt: true })` interrupt carries `{ id, toolCallId, reason, message }` and no `metadata`, so `interrupt.metadata.action` is always undefined and the approval panel can never render.",
      },
    ],
  },

  "/backend/copilot-runtime": {
    demonstrates: "The agent map the runtime publishes at `/info` (each key is a routing name), and the doc's direct connection: a nested `CopilotKitProvider :agents__unsafe_dev_only` with an `HttpAgent`.",
    tryIt: {
      prompts: ["Hello direct agent"],
      pass: "The table lists all nine agents; the direct panel answers 'The weather in San Francisco is 72°F.' (router-custom, no key needed).",
    },
    demoFiles: [demo("/backend/copilot-runtime"), `${D}/runtime/DirectAgUi.vue`],
    sources: [{ title: "Runtime", files: ["backend/server.ts"] }],
  },

  "/backend/runtime-endpoints": {
    demonstrates: "Each endpoint from the doc's multi-route table, called from the browser with its raw status and body.",
    tryIt: {
      prompts: ["(click) POST /agent/router-custom/run", "(click) GET /threads/:id/messages", "(click) GET /threads"],
      pass: "/run → 200 SSE; messages/events/state → 200; invalid stop body → 400; inspector-metadata → 204.",
      fail: "Recorded: GET /threads and POST /threads/clear → 403 thread_access_not_configured, contrary to the doc.",
    },
    demoFiles: [demo("/backend/runtime-endpoints")],
  },

  "/backend/custom-agent": {
    demonstrates: "`BuiltInAgent` factory mode: `type: \"custom\"` yields AG-UI events from a generator (the doc's scripted tool-call sample), `type: \"aisdk\"` wraps `streamText` with converted messages and tools.",
    tryIt: {
      prompts: ["What's the weather?", "Say hello in five words."],
      pass: "custom: TOOL_CALL_* events then 'The weather in San Francisco is 72°F.' aisdk: a streamed reply.",
      fail: "aisdk → RUN_ERROR without a key.",
    },
    demoFiles: [demo("/backend/custom-agent"), "frontend/src/components/EventLog.vue"],
    sources: [AGENTS],
  },

  "/backend/agent-runner": {
    demonstrates: "The runtime's explicit `InMemoryAgentRunner({ maxThreads, maxRunsPerThread, maxBytes })`, and reading back exactly what it stored for one thread.",
    tryIt: {
      prompts: ["persist me", "(click) messages"],
      pass: "`200` and your message in the stored history.",
      fail: "Empty after a backend restart: expected, the runner is in-memory.",
    },
    demoFiles: [demo("/backend/agent-runner")],
    sources: [{ title: "Runner configuration", files: ["backend/server.ts"] }],
  },

  "/backend/ag-ui": {
    demonstrates: "`agent.subscribe` with every callback in the doc's event table, and the proxy pattern: the frontend agent is a `ProxiedCopilotRuntimeAgent`, not the server's BuiltInAgent.",
    tryIt: {
      prompts: ["hello"],
      pass: "The log fills with RUN_STARTED, TOOL_CALL_*, TEXT_MESSAGE_*, RUN_FINISHED and onRunFinalized.",
    },
    demoFiles: [demo("/backend/ag-ui"), "frontend/src/components/EventLog.vue"],
  },

  "/multi-agent/subagents": {
    demonstrates: "A supervisor (`subagents`) delegating to research, writing and critique sub-agents, each a separate model call behind a server tool; each delegation renders as a card and feeds a live log.",
    tryIt: {
      prompts: ["Write a short paragraph about why Vue composables are useful."],
      pass: "Three delegation cards (🔎 ✍️ 🧐), the log fills, then a final answer.",
      fail: "No delegations: the supervisor answered directly.",
    },
    demoFiles: [demo("/multi-agent/subagents"), `${D}/subagents/DelegationCard.vue`],
    sources: [AGENTS],
    callouts: [{ tone: "info", title: "Ported, not copied", body: "The Vue doc's delegation-log section is empty and its backend sample is Python/LangGraph; this is the same pattern on BuiltInAgent." }],
  },
};
