# CopilotKit + Vue Test Suite

A Vue 3 app with one working test page per page of the CopilotKit Vue docs, a local Copilot Runtime running `BuiltInAgent`, and an autorecorder that turns every page into a demo video.

**Doc sync:** 2026-11-12 · **Packages:** `@copilotkit/vue` 1.87.0, `@copilotkit/runtime` 1.87.0, `@ag-ui/client` 1.0.2 · **Status:** 21 ✅ · 4 ⚠️ · 1 ❌ · 2 🔑 · 23 ⛔ not in Vue docs (see [§8](#8-testing-checklist--current-status)) · **Recordings:** 27 of 28 pages pass, plus 1 honest fail ([§13](#13-autorecorder))

---

## 1. Overview

`@copilotkit/vue` is CopilotKit's Vue 3 frontend: components such as `CopilotChat` and composables such as `useAgent`, `useFrontendTool` and `useThreads`. It talks to a Copilot Runtime over the AG-UI protocol. This repo is a QA harness for that integration. Every page of [docs.copilotkit.ai/vue](https://docs.copilotkit.ai/vue), plus every item on the requested checklist, gets a route:

- **`/<route>`**, the notes page: what it demonstrates, what to try, pass/fail criteria, and the exact source files that implement it, read from the repo and syntax-highlighted.
- **`/<route>/demo-chat`**, the live demo: chrome-free and full-height, meant to be used or screen-recorded.

Where the package does not behave as documented, the page stays broken on purpose and the gap is recorded. The UI follows the React built-in-agent harness (sidebar with status dots, route header with "Open demo ↗", panels, "Try it" boxes, Shiki code figures, status overview).

## 2. Architecture

```
 Browser (Vite :5173)                     Node (tsx :8200)                     Model provider
┌────────────────────────┐  HTTP + SSE  ┌──────────────────────────────┐      ┌───────────────┐
│ Vue 3 + vue-router     │  AG-UI       │ CopilotRuntime /api/copilotkit│ ───▶ │ OpenAI (default)│
│ Tailwind v4 · Shiki    │ ───────────▶ │  ├─ InMemoryAgentRunner       │      │ Anthropic /   │
│ <CopilotKitProvider>   │ ◀─────────── │  ├─ BuiltInAgent × 7 (LLM)    │      │ Google (opt.) │
│  ├─ /<route>      notes│  cors: true  │  └─ BuiltInAgent factory × 2  │      └───────────────┘
│  └─ /<route>/demo-chat │              │     (aisdk, custom/offline)  │ ───▶ MCP server (opt.)
└────────────────────────┘              └──────────────────────────────┘
          ▲
          └── autorecorder/ (Playwright + installed Chrome): doc page → simulated VS Code → demo
```

- **Frontend:** Vue 3 + Vite + TypeScript + vue-router + Tailwind v4. A single root `CopilotKitProvider` (in `src/App.vue`) points at the runtime, so a demo route continues the agent state of the notes page it was opened from. The direct-AG-UI demo mounts its own isolated provider.
- **Backend:** Node 20+ / TypeScript run with `tsx`, as the Vue quickstart prescribes: a plain `node:http` server using `createCopilotNodeListener`. No Python.
- **Agents** (`backend/agents/index.ts`). The ids match the ones the Vue doc samples use:

| Agent id | Kind | Used by |
| --- | --- | --- |
| `default` | BuiltInAgent + mock tools (`get_weather`, `search_flights`, `get_stock_price`, `roll_d20`) + interrupting `execute_governed_action` | Quickstart, Tool Rendering, Component as tool, Frontend Tools, Render state, Read-only context, HITL, Governed actions, Inspector |
| `my-agent` | BuiltInAgent + `get_weather` | Prebuilt components, Slots, Headless UI, Headless threads, Thread lifecycle |
| `sales` | BuiltInAgent + `get_sales_data` | Programmatic Control |
| `workspace` | BuiltInAgent (state tools) | Shared State |
| `support` | BuiltInAgent | Threads Drawer, Thread lifecycle (panel 3) |
| `mcp-apps` | BuiltInAgent + MCP Apps server (opt-in) | MCP Apps |
| `subagents` | BuiltInAgent supervisor + 3 sub-agent tools | SubAgents |
| `router-aisdk` | `BuiltInAgent({ type: "aisdk" })` | Use any model router |
| `router-custom` | `BuiltInAgent({ type: "custom" })`, scripted AG-UI events, **no key needed** | Model router, AG-UI, Runtime endpoints, AgentRunner, Copilot Runtime |

## 3. Prerequisites

| Tool | Version used |
| --- | --- |
| Node.js | 20+ (verified on 24.19.0) |
| npm | 10+ (verified on 11.17.0) |
| Google Chrome | any current version (used by the autorecorder) |

Keys and accounts:

- **`OPENAI_API_KEY`**: required for every page that talks to an LLM. Without it those pages load, but runs end in `RUN_ERROR`.
- `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY`: only if you point `COPILOT_MODEL` at those providers.
- **CopilotKit public license key + Intelligence**: only for the Threads pages. Optional; without them you test the unlicensed behaviour.

## 4. Setup

```bash
git clone <this-repo-url> CPK-Built-In-Agent-Vue
cd CPK-Built-In-Agent-Vue
npm run install:all          # root + backend + frontend
cp .env.example .env         # or put backend variables in backend/.env
```

The backend reads `backend/.env` first, then the root `.env`. The frontend reads the root `.env`, and only `VITE_*` variables reach the browser.

| Variable | Used by | What it does |
| --- | --- | --- |
| `OPENAI_API_KEY` | backend | Key for the default `openai:gpt-6-luna` model. |
| `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` | backend | Only if `COPILOT_MODEL` points at those providers. |
| `COPILOT_MODEL` | backend | Model for every LLM-backed BuiltInAgent. Default `openai:gpt-6-luna`. |
| `PORT` | backend | Runtime port. Default **8200**. |
| `MCP_APPS_SERVER_URL` | backend | Enables the MCP Apps page, e.g. `https://mcp.excalidraw.com/mcp`. |
| `COPILOT_DEBUG` | backend | `true` or `verbose`: runtime Debug Mode logging. |
| `VITE_RUNTIME_URL` | frontend | Runtime endpoint. Default `http://localhost:8200/api/copilotkit`. |
| `VITE_COPILOTKIT_PUBLIC_LICENSE_KEY` | frontend | Threads license. Empty = unlicensed behaviour. |

Default ports: **frontend 5173**, **backend 8200**.

## 5. Running the project

```bash
npm run dev            # both, via concurrently
# or separately:
npm run dev:backend    # tsx watch server.ts
npm run dev:frontend   # vite
```

A successful startup looks like this:

```
[runtime] Copilot Runtime listening at http://localhost:8200/api/copilotkit
[runtime]   model:      openai:gpt-6-luna
[runtime]   OPENAI_API_KEY    set
[vue]       VITE v8.x  ready in … ms  ➜  Local: http://localhost:5173/
```

The runtime also prints a telemetry notice and a warning that thread listing needs `identifyUser` ([§9](#9-known-issues--doc-vs-implementation-discrepancies)). Both are expected.

Open **http://localhost:5173**. The Introduction page probes `/api/copilotkit/info` and lists the agents. Other scripts: `npm run typecheck`, `npm run build`.

## 6. Using the app

- **Sidebar:** mirrors the Vue doc nav, with folder sub-headings. The dot colour is the page's status: green working, amber partial, red broken, violet untested, grey not in the Vue docs. **Status overview** lists every page in one table.
- **Notes page:** title, status pill, summary, then **Open demo ↗** (a new tab with the chrome-free demo), **Doc page being tested ↗**, and "All statuses". Below that:
  - **What it demonstrates**, with a **Try it** box (prompts, Pass, Fail).
  - Callouts for doc discrepancies.
  - **The demo** and the other source panels, which show this repo's files verbatim.
- **Errors:** anything CopilotKit reports through `onError` appears as a red box under the route header.
- **Inspector:** the button in a corner is CopilotKit's dev overlay, shown automatically in dev builds.

## 7. What to expect — walkthrough per section

Every demo below is at `<route>/demo-chat`. Its notes page carries the exact prompts and the pass/fail criteria. These are the ones the autorecorder uses ([§13](#13-autorecorder)).

| Route | Try | ✅ Success | ❌ Failure |
| --- | --- | --- | --- |
| `/quickstart` | *Can you tell me a joke?* | Streamed markdown reply from `default`. | No reply, plus a red error box: no key, or the runtime is down. |
| `/prebuilt-components` | One prompt per tab (Chat, Sidebar, Popup) | All three surfaces answer and continue one conversation. | A surface does not mount. |
| `/prebuilt-components/chat` | Any prompt | The event log shows `input-change`, then `submit-message`. Custom labels are applied. | Events missing. |
| `/prebuilt-components/sidebar` | Any prompt | Docked 420px panel with the custom header, which prints its slot props. | The header shows `✗ close not provided` (the known doc gap, §9). |
| `/prebuilt-components/popup` | Any prompt | 420×560 overlay answers. Clicking outside closes it. | — |
| `/prebuilt-components/chat-controls` | Prompt, then 👍. Then the round button | `feedback {messageId, value}` is logged. The button switches between "Ask the assistant" and "Close chat". | Nothing logged. |
| `/custom-look-and-feel/slots` | Go through all 8 tabs | Custom welcome card, Reviewed badge, props override, custom message view, ⭐ toolbar action, "Copy response", custom labels. | **Disclaimer tab renders nothing** (§9). |
| `/custom-look-and-feel/headless-ui` | *What is the weather in Oslo?* | Minimal: text only, no tool card (by design). Complete: the same conversation through CopilotChatMessageView. | — |
| `/programmatic-control` | Click **Run agent** | Lifecycle log shows `started` → `done`, and the `sales` summary appears. | `failed: …` |
| `/inspector` | *Call inspector_ping twice…* | Ping counter goes up. Inspector panes list agents, events, the tool and the context. | No Inspector button. |
| `/threads/drawer` | Any prompt | With license + Intelligence: thread list. | **Without: stuck on "Loading threads…"** instead of the documented locked view. |
| `/threads/headless` | Any prompt | With Intelligence: rows sync. | Without: "Thread endpoints are not available" (expected). |
| `/threads/lifecycle` | Prompt in panel 1 → Remount → Use #1's id | History replays on remount. Restore reports `restored N message(s)`. | Empty replay after a backend restart (in-memory runner). |
| `/generative-ui/mcp-apps` | *Draw a simple flowchart of a login process.* | With `MCP_APPS_SERVER_URL`: the MCP App UI renders in a sandboxed iframe. | Text-only reply means no MCP server is configured. |
| `/generative-ui/tool-rendering` | *Weather in Tokyo and roll a d20* (per-tool tab), *Find flights to Lisbon* (catch-all tab) | Blue WeatherToolCard, the default card, purple BrandedToolCard. | Raw JSON or no card. |
| `/generative-ui/tool-based` | *Show me the weather card for Berlin, 18 degrees, cloudy.* | WeatherCard renders inline. | Text only. |
| `/frontend-tools` | *Only show sev1 incidents.* then *Show everything again.* | Filter changes to sev1, then back to all. | Filter unchanged. |
| `/shared-state` | Click *Prefer concise answers*. *Add a note: …*. *What tone do I prefer?* | Raw state updates. The note appears. The agent answers "concise". | Raw state unchanged. |
| `/shared-state/rendering-in-app` | *Rename the project to Vue launch and add an item…* | Canvas title and list update from the agent's state write. | Canvas says "Untitled". |
| `/shared-state/agent-readonly` | *Which workspace am I in?*, change the dropdown, ask again | The agent follows the context value. | It does not know the workspace. |
| `/human-in-the-loop` | *Schedule a meeting with Dana about the Q4 roadmap.* | Time-picker card. Picking a slot resumes the run. | Text only. |
| `/human-in-the-loop/governed-actions` | The `approve_governed_action` prompt on the notes page | Approval card. Approve resumes the run. | **Pattern A (`useInterrupt`) panel stays empty** (§9). |
| `/backend/copilot-runtime` | Any prompt in the direct panel | Agent table from `/info`. The direct HttpAgent answers "72°F" (no key needed). | — |
| `/backend/runtime-endpoints` | Click the endpoint buttons | `/run` 200 SSE, thread routes 200, invalid stop 400, inspector-metadata 204. | `GET /threads` and `/threads/clear` return **403** (§9). |
| `/backend/custom-agent` | Any prompt on each tab | custom: TOOL_CALL events, then "72°F". aisdk: streamed reply. | aisdk without a key: RUN_ERROR. |
| `/backend/agent-runner` | *persist me* → **messages** | 200 with your message in the stored history. | Empty after a restart (in-memory). |
| `/backend/ag-ui` | *hello* | Every subscriber callback logs. The frontend agent is a `ProxiedCopilotRuntimeAgent`. | No events. |
| `/multi-agent/subagents` | *Write a short paragraph about why Vue composables are useful.* | 🔎 ✍️ 🧐 delegation cards, a live log, then a final answer. | No delegations. |

The 23 ⛔ items render a "Not documented for Vue" page with the probed URL, the HTTP result, and where the topic exists for other frameworks.

## 8. Testing checklist / current status

Legend: ✅ Working (exercised end to end) · ⚠️ Partial · ❌ Broken · 🔑 Untested (needs a paid service or optional config) · 📘 Reference · ⛔ Not in the Vue docs.
Every ✅ was verified on 2026-11-12 by the autorecorder against a live `openai:gpt-6-luna` runtime. Each page's own DOM evidence was required, not just a reply. Generated from `frontend/src/lib/nav-config.ts`, the same data the sidebar and Status page use.

| Doc page | Route | Status | Notes |
| --- | --- | --- | --- |
| **Getting Started** | | | |
| [Introduction](https://docs.copilotkit.ai/vue) | `/` | 📘 | Landing page: orientation and runtime connection check. |
| [Quickstart](https://docs.copilotkit.ai/vue) | `/quickstart` · [demo](http://localhost:5173/quickstart/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: streamed reply from the default agent. |
| **Basics** | | | |
| [Prebuilt Components](https://docs.copilotkit.ai/vue/prebuilt-components) | `/prebuilt-components` · [demo](http://localhost:5173/prebuilt-components/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: all three surfaces answer and share the conversation. |
| [CopilotChat](https://docs.copilotkit.ai/vue/prebuilt-components/chat) | `/prebuilt-components/chat` · [demo](http://localhost:5173/prebuilt-components/chat/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: events logged, custom labels applied. |
| [CopilotSidebar](https://docs.copilotkit.ai/vue/prebuilt-components/sidebar) | `/prebuilt-components/sidebar` · [demo](http://localhost:5173/prebuilt-components/sidebar/demo-chat) | ⚠️ | Works, but the doc's header slot props (toggle/open/close) do not exist; 1.87.0 passes {title, onClose, isOpen}. |
| [CopilotPopup](https://docs.copilotkit.ai/vue/prebuilt-components/popup) | `/prebuilt-components/popup` · [demo](http://localhost:5173/prebuilt-components/popup/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model. |
| [Open, close & feedback](https://docs.copilotkit.ai/vue/prebuilt-components/chat-controls) | `/prebuilt-components/chat-controls` · [demo](http://localhost:5173/prebuilt-components/chat-controls/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: toggle-button slot opens the popup; thumbs-up emits feedback. |
| [Slots](https://docs.copilotkit.ai/vue/custom-look-and-feel/slots) | `/custom-look-and-feel/slots` · [demo](http://localhost:5173/custom-look-and-feel/slots/demo-chat) | ⚠️ | 7 of 8 samples work. The disclaimer sample never renders: the input slot props do not include showDisclaimer. |
| [Fully Headless UI](https://docs.copilotkit.ai/vue/custom-look-and-feel/headless-ui) | `/custom-look-and-feel/headless-ui` · [demo](http://localhost:5173/custom-look-and-feel/headless-ui/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: minimal and complete variants. |
| [Programmatic Control](https://docs.copilotkit.ai/vue/programmatic-control) | `/programmatic-control` · [demo](http://localhost:5173/programmatic-control/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: started → done, sales summary produced. |
| [Inspector](https://docs.copilotkit.ai/vue/inspector) | `/inspector` · [demo](http://localhost:5173/inspector/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: overlay mounted, inspector_ping called by the agent. |
| [Threads Drawer](https://docs.copilotkit.ai/vue/prebuilt-components/copilot-threads-drawer) | `/threads/drawer` · [demo](http://localhost:5173/threads/drawer/demo-chat) | ❌ | Without a license the drawer never shows the documented locked view; it stays on 'Loading threads…'. |
| [Headless Threads](https://docs.copilotkit.ai/vue/headless-threads) | `/threads/headless` · [demo](http://localhost:5173/threads/headless/demo-chat) | 🔑 | Needs an Intelligence-connected runtime; without one useThreads reports that thread endpoints are unavailable. |
| [Thread History Lifecycle](https://docs.copilotkit.ai/vue/threads-lifecycle) | `/threads/lifecycle` · [demo](http://localhost:5173/threads/lifecycle/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: explicit thread-id stored, replayed on remount, restored with setMessages. |
| **Generative UI** | | | |
| [Components and surfaces](https://docs.copilotkit.ai/vue/generative-ui/components) | `/generative-ui/components` | ⛔ | Probe: 404 |
| [Surfaces](https://docs.copilotkit.ai/vue/generative-ui/components/surfaces) | `/generative-ui/components/surfaces` | ⛔ | Probe: 404 |
| [Catalogs](https://docs.copilotkit.ai/vue/generative-ui/components/catalogs) | `/generative-ui/components/catalogs` | ⛔ | Probe: 404 |
| [Standard Catalog](https://docs.copilotkit.ai/vue/generative-ui/components/standard-catalog) | `/generative-ui/components/standard-catalog` | ⛔ | Probe: 307 → non-Vue page |
| [State and actions](https://docs.copilotkit.ai/vue/generative-ui/components/state-and-actions) | `/generative-ui/components/state-and-actions` | ⛔ | Probe: 404 |
| [Theming](https://docs.copilotkit.ai/vue/generative-ui/components/theming) | `/generative-ui/components/theming` | ⛔ | Probe: 404 |
| [Transports](https://docs.copilotkit.ai/vue/generative-ui/components/transports) | `/generative-ui/components/transports` | ⛔ | Probe: 404 |
| [Markdown Mode](https://docs.copilotkit.ai/vue/generative-ui/components/markdown-mode) | `/generative-ui/components/markdown-mode` | ⛔ | Probe: 404 |
| [Adopt from A2UI](https://docs.copilotkit.ai/vue/generative-ui/components/from-a2ui) | `/generative-ui/components/from-a2ui` | ⛔ | Probe: 404 |
| [A2UI](https://docs.copilotkit.ai/vue/generative-ui/a2ui) | `/generative-ui/a2ui` | ⛔ | Probe: 404 |
| [Fixed Schema A2UI](https://docs.copilotkit.ai/vue/generative-ui/a2ui/fixed-schema) | `/generative-ui/a2ui/fixed-schema` | ⛔ | Probe: 404 |
| [Dynamic Schema A2UI](https://docs.copilotkit.ai/vue/generative-ui/a2ui/dynamic-schema) | `/generative-ui/a2ui/dynamic-schema` | ⛔ | Probe: 404 |
| [JSON Render](https://docs.copilotkit.ai/vue/generative-ui/json-render) | `/generative-ui/json-render` | ⛔ | Probe: 404 |
| [Hashbrown](https://docs.copilotkit.ai/vue/generative-ui/hashbrown) | `/generative-ui/hashbrown` | ⛔ | Probe: 404 |
| [MCP Apps](https://docs.copilotkit.ai/vue/generative-ui/mcp-apps) | `/generative-ui/mcp-apps` · [demo](http://localhost:5173/generative-ui/mcp-apps/demo-chat) | 🔑 | Needs MCP_APPS_SERVER_URL on the runtime; recorded without one (text reply only). |
| [Open Generative UI](https://docs.copilotkit.ai/vue/generative-ui/open-generative-ui) | `/generative-ui/open-generative-ui` | ⛔ | Probe: 404 |
| [Tool Rendering](https://docs.copilotkit.ai/vue/generative-ui/tool-rendering) | `/generative-ui/tool-rendering` · [demo](http://localhost:5173/generative-ui/tool-rendering/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: WeatherToolCard, default card and BrandedToolCard all render. |
| [Component as tool](https://docs.copilotkit.ai/vue/generative-ui/tool-based) | `/generative-ui/tool-based` · [demo](http://localhost:5173/generative-ui/tool-based/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: WeatherCard rendered by the agent's show_weather call. |
| **App Control** | | | |
| [Frontend Tools](https://docs.copilotkit.ai/vue/frontend-tools) | `/frontend-tools` · [demo](http://localhost:5173/frontend-tools/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: filter_incidents runs in the browser (sev1, then all). |
| **Shared State** | | | |
| [Shared State](https://docs.copilotkit.ai/vue/shared-state) | `/shared-state` · [demo](http://localhost:5173/shared-state/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: app → agent and agent → app writes both land. |
| [Render agent state in your app](https://docs.copilotkit.ai/vue/shared-state/rendering-in-app) | `/shared-state/rendering-in-app` · [demo](http://localhost:5173/shared-state/rendering-in-app/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: the agent renamed the canvas and added an item. |
| [Agent Read-Only Context](https://docs.copilotkit.ai/vue/shared-state/agent-readonly) | `/shared-state/agent-readonly` · [demo](http://localhost:5173/shared-state/agent-readonly/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: the agent follows the context value as it changes. |
| **Human In The Loop** | | | |
| [HITL Overview](https://docs.copilotkit.ai/vue/human-in-the-loop) | `/human-in-the-loop` · [demo](http://localhost:5173/human-in-the-loop/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: time picker rendered, choice resumed the run. |
| [Governed Action Approval UI](https://docs.copilotkit.ai/vue/human-in-the-loop/governed-actions) | `/human-in-the-loop/governed-actions` · [demo](http://localhost:5173/human-in-the-loop/governed-actions/demo-chat) | ⚠️ | useHumanInTheLoop approval works. The useInterrupt pattern cannot render with BuiltInAgent: its interrupts carry no metadata.action. |
| **Built-in Agent** | | | |
| [Server Tools](https://docs.copilotkit.ai/vue/built-in-agent/server-tools) | `/built-in-agent/server-tools` | ⛔ | Probe: 307 → /vue/server-tools → 404 |
| [MCP servers](https://docs.copilotkit.ai/vue/built-in-agent/mcp) | `/built-in-agent/mcp-servers` | ⛔ | Probe: 307 → /vue/mcp → 404 |
| [Advanced Configuration](https://docs.copilotkit.ai/vue/built-in-agent/advanced-configuration) | `/built-in-agent/advanced-configuration` | ⛔ | Probe: 404 |
| [Model Selection](https://docs.copilotkit.ai/vue/built-in-agent/model-selection) | `/built-in-agent/model-selection` | ⛔ | Probe: 307 → /vue/model-selection → 404 |
| [OpenAI](https://docs.copilotkit.ai/vue/built-in-agent/model-selection/openai) | `/built-in-agent/model-selection/openai` | ⛔ | Probe: 404 |
| [Anthropic](https://docs.copilotkit.ai/vue/built-in-agent/model-selection/anthropic) | `/built-in-agent/model-selection/anthropic` | ⛔ | Probe: 404 |
| [Google](https://docs.copilotkit.ai/vue/built-in-agent/model-selection/google) | `/built-in-agent/model-selection/google` | ⛔ | Probe: 404 |
| **Runtime** | | | |
| [Copilot Runtime](https://docs.copilotkit.ai/vue/backend/copilot-runtime) | `/backend/copilot-runtime` · [demo](http://localhost:5173/backend/copilot-runtime/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: /info agent map and the direct HttpAgent connection. |
| [Runtime HTTP endpoints](https://docs.copilotkit.ai/vue/backend/runtime-endpoints) | `/backend/runtime-endpoints` · [demo](http://localhost:5173/backend/runtime-endpoints/demo-chat) | ⚠️ | Run, connect, stop and thread-history routes work. GET /threads and POST /threads/clear return 403, contrary to the doc. |
| [Use any model router](https://docs.copilotkit.ai/vue/backend/custom-agent) | `/backend/custom-agent` · [demo](http://localhost:5173/backend/custom-agent/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: both the custom and aisdk factory agents answer. |
| [AgentRunner and persistence](https://docs.copilotkit.ai/vue/backend/agent-runner) | `/backend/agent-runner` · [demo](http://localhost:5173/backend/agent-runner/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: the runner returns the stored thread history. |
| [Connect AG-UI agents](https://docs.copilotkit.ai/vue/backend/ag-ui) | `/backend/ag-ui` · [demo](http://localhost:5173/backend/ag-ui/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: every subscriber callback fires; frontend agent is a ProxiedCopilotRuntimeAgent. |
| [Authentication](https://docs.copilotkit.ai/vue/auth) | `/backend/authentication` | ⛔ | Probe: 404 |
| [SubAgents](https://docs.copilotkit.ai/vue/multi-agent/subagents) | `/multi-agent/subagents` · [demo](http://localhost:5173/multi-agent/subagents/demo-chat) | ✅ | Verified 2026-11-12 by the autorecorder with a live model: research → writing → critique delegations, then a final answer. Ported from a Python-only sample. |
| **Troubleshooting** | | | |
| [Known issues & notes](https://docs.copilotkit.ai/vue/troubleshooting/common-issues) | `/troubleshooting` | 📘 |  |

Also: the "Threads" heading itself (`/vue/threads`) permanently redirects (308) to `/vue/AG-UI-Streams`, so it has no page of its own.

## 9. Known issues / doc-vs-implementation discrepancies

None of these is worked around in the library; the demos show the actual behaviour. The only adaptations are TypeScript casts where the runtime works but the published types reject a doc sample. Each is commented in the code. The same list is in the app at `/troubleshooting`.

1. **The Slots disclaimer sample never renders**: [slots](https://docs.copilotkit.ai/vue/custom-look-and-feel/slots). `#input` → `<CopilotChatInput v-bind="inputProps">` → `#disclaimer` shows nothing. CopilotChatInput renders its disclaimer only when `showDisclaimer` is true, and the input slot props do not include it. Neither the custom nor the default disclaimer appears. Verified by the autorecorder.
2. **Runtime thread routes return 403**: [runtime-endpoints](https://docs.copilotkit.ai/vue/backend/runtime-endpoints). The doc says `GET /threads` works without Intelligence and that `POST /threads/clear` "always answers 204". In 1.87.0, both return `403 thread_access_not_configured` unless the runtime sets `identifyUser` or `threads: { access: "open" }`.
3. **The Threads Drawer never shows its locked view**: [copilot-threads-drawer](https://docs.copilotkit.ai/vue/prebuilt-components/copilot-threads-drawer). With no license key and no Intelligence, it shows "Loading threads…" indefinitely and never requests threads.
4. **Sidebar/Popup `header` slot props**: [sidebar](https://docs.copilotkit.ai/vue/prebuilt-components/sidebar). The doc lists `toggle`, `open`, `close`. The actual props are `{ title, onClose, isOpen }`. The `toggle-button` slot does match the doc.
5. **Governed actions with `useInterrupt`**: [governed-actions](https://docs.copilotkit.ai/vue/human-in-the-loop/governed-actions). The sample reads `interrupt.metadata.action`. A `BuiltInAgent` tool with `interrupt: true` emits `{ id, toolCallId, reason, message }` and no `metadata`, so that panel can never render with the built-in agent. The `useHumanInTheLoop` pattern on the same page works.
6. **`labels` prop typing**: `CopilotChatLabels = typeof CopilotChatDefaultLabels`, so custom label strings fail `vue-tsc`, although they work at runtime.
7. **Render-component typing**: components that declare only the props they use (the doc's `WeatherToolCard`, `GovernedActionCard`) are not assignable to the `render` type of `useRenderTool` / `useDefaultRenderTool` / `useHumanInTheLoop`. They work at runtime.
8. **Failed runs are silent in the chat**: on `RUN_ERROR`, `CopilotChat` shows nothing. The error reaches only `onError` and the Inspector.
9. **Model string separator**: the quickstart uses `openai:gpt-6-luna`; types and errors use `openai/…`. Both parse.
10. **Inconsistent imports in the model-router samples**: [custom-agent](https://docs.copilotkit.ai/vue/backend/custom-agent). The samples import `createCopilotRuntimeHandler` but call `createCopilotEndpoint`. Both exist.
11. **Vue doc sections with no Vue code**: the [sub-agents](https://docs.copilotkit.ai/vue/multi-agent/subagents) delegation log, [shared-state streaming](https://docs.copilotkit.ai/vue/shared-state) (Python only), and the [AG-UI](https://docs.copilotkit.ai/vue/backend/ag-ui) code blocks are empty. So is "Tools I registered don't show up" in [common issues](https://docs.copilotkit.ai/vue/troubleshooting/common-issues).
12. **Checklist items missing for Vue**: 23 items return 404 (or redirect off-Vue) under `/vue/…`. They are listed in §8 with their probe results.

## 10. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Chat renders unstyled | `@copilotkit/vue/styles.css` must be imported once, in `frontend/src/main.ts`. |
| Introduction says the runtime is unreachable | Start the backend. `curl http://localhost:8200/api/copilotkit/info` must return JSON. |
| CORS errors | Vite and the runtime are different origins, so `backend/server.ts` keeps `cors: true`. Set an explicit origin before deploying. |
| `RUN_ERROR: OpenAI API key is missing` | Put `OPENAI_API_KEY` in `backend/.env` (or the root `.env`) and restart the backend. |
| A chat's explicit `thread-id` is ignored | Two chats with the same agent-id share one agent instance. A `CopilotChatConfigurationProvider` for that agent-id moves its thread. Use different agent-ids (see the Thread Lifecycle demo). |
| Connect route returns 404 on a fresh thread | The agent-id is not registered. Compare it with the keys in `/info`. |
| Runtime memory keeps growing | Lower the `InMemoryAgentRunner` limits in `backend/server.ts`. |
| Need the server-side event pipeline | Run the backend with `COPILOT_DEBUG=true` (or `verbose`). |
| `GET /threads` → 403 / drawer spins forever | Known issues §9.2 and §9.3. |

## 11. Project structure

```
CPK-Built-In-Agent-Vue/
├── CLAUDE.md · README.md · .env.example · package.json   (root scripts)
├── docs-snapshot/                 raw .md of every Vue doc page used (2026-11-12)
├── backend/
│   ├── server.ts                  CopilotRuntime + InMemoryAgentRunner + mcpApps + debug, :8200
│   └── agents/index.ts            every agent id (BuiltInAgent classic + factory modes)
├── frontend/src/
│   ├── lib/nav-config.ts          ★ nav, routes, doc links, statuses (no imports; read by the autorecorder)
│   ├── lib/route-notes.ts         per-route notes: demonstrates, Try it, source panels, callouts
│   ├── lib/source.ts · highlight.ts   repo files as raw strings + Shiki
│   ├── router.ts                  notes route + /demo-chat route derived from nav-config
│   ├── App.vue                    root CopilotKitProvider; sidebar layout or full-bleed demo
│   ├── components/                NavSidebar, RouteHeader, StatusBadge, DemoFrame, EventLog, ui/*
│   ├── views/                     Home, Status, RouteNotes, NotInVueDocs, Troubleshooting
│   ├── routes/<route>/demo-chat/DemoChat.vue   one chrome-free demo per doc page
│   └── demos/                     the doc's own components, close to verbatim
└── autorecorder/                  see §13
```

## 12. References

All Vue doc pages tested are linked in §8. Snapshots of each, as fetched, are in `docs-snapshot/`. API reference: [docs.copilotkit.ai/reference/vue](https://docs.copilotkit.ai/reference/vue).

## 13. Autorecorder

`autorecorder/` records one video per demo page. For each page it:

1. Opens the live Vue doc page and scrolls it.
2. Switches to a simulated VS Code showing this repo's code for that page, ending on `frontend/package.json`, so the clip shows the package versions.
3. Switches to Chrome and drives the demo.

It is a port of the React built-in-agent repo's recorder: `core/`, `cli.ts`, `manifest.ts` and `coverage.ts` are unchanged copies, and only `config/` and `actions/` were adapted. Full guide: [autorecorder/README.md](autorecorder/README.md).

```bash
npm run dev                         # both services must be up
cd autorecorder && npm install
npm run doctor && npm run coverage  # both exit 0 (verified)
npm run record                      # all 28 pages → videos/BUILTIN-vue-NN-Name.webm
npm run manifest                    # commit videos/manifest.json + MANIFEST.md
```

**Last full run, 2026-11-12, live model:** 27 pages pass, each with its feature evidence required. **Slots fails honestly** at its final step, the disclaimer slot (§9.1). Its other seven tabs are filmed first. Videos are gitignored; the manifest records what each clip shows.

Recorder findings reported rather than changed (the recorder's `core/` must not be edited):

- **`.vue` code shows as plain text in the simulated IDE.** `core/ide/generator.ts` has no Vue grammar. The fix is one line, to be ported to all repos.
- **`npm run doctor:online` could not run in the build environment.** It always uses Playwright's bundled headless Chromium, which was blocked from executing there. Recordings use the installed Chrome and work. Run `doctor:online` on your machine.
- Log text still says "Next.js compilation & React hydration".
