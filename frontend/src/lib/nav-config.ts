/**
 * The nav, the route headers, the status page and the README status table all
 * read from here, so a doc page and its implementation status are described
 * exactly once.
 *
 * This file has NO imports on purpose: `autorecorder/coverage.ts` loads it
 * directly in Node to check that every `hasDemo` route is registered with the
 * recorder, in nav order.
 *
 * `docPath` is appended to DOCS_ROOT. Items on the requested checklist that the
 * Vue docs do not have are kept, with `status: "not-in-docs"` and the probe
 * result, so their absence stays visible instead of silently disappearing.
 */

export const DOCS_ROOT = "https://docs.copilotkit.ai";

/** Date the Vue doc tree was last probed and snapshotted into docs-snapshot/. */
export const DOC_SYNC_DATE = "2026-11-12";

export type RouteStatus =
  | "working"
  | "partial"
  | "broken"
  | "untested"
  | "reference"
  | "not-in-docs";

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: "Working",
  partial: "Partial",
  broken: "Broken",
  untested: "Untested",
  reference: "Reference",
  "not-in-docs": "Not in Vue docs",
};

export interface RouteMeta {
  path: string;
  title: string;
  /** Path under DOCS_ROOT, e.g. "/vue/frontend-tools". */
  docPath: string;
  summary: string;
  status: RouteStatus;
  statusNote?: string;
  /** The doc sidebar folder the page sits in, under its group heading. */
  folder?: string;
  /** Owns a live, chrome-free surface at `<path>/demo-chat`. */
  hasDemo?: boolean;
  /** Requires CopilotKit Intelligence / a license to fully work. */
  premium?: boolean;
  /** For not-in-docs items: what was probed and what came back. */
  probe?: { result: string; elsewhere?: string };
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === "/" ? "/demo-chat" : `${route.path}/demo-chat`;
}

export function docUrl(route: RouteMeta): string {
  return `${DOCS_ROOT}${route.docPath}`;
}

const missing = (
  path: string,
  title: string,
  docPath: string,
  result: string,
  folder?: string,
  elsewhere?: string,
): RouteMeta => ({
  path,
  title,
  docPath,
  folder,
  summary: "On the requested checklist, but the Vue docs have no page for it.",
  status: "not-in-docs",
  probe: { result, elsewhere },
});

export const NAV: NavGroup[] = [
  {
    title: "Getting Started",
    routes: [
      {
        path: "/",
        title: "Introduction",
        docPath: "/vue",
        summary: "What this harness covers, the live agent roster, and how the pieces connect.",
        status: "reference",
        statusNote: "Landing page: orientation and runtime connection check.",
      },
      {
        path: "/quickstart",
        hasDemo: true,
        title: "Quickstart",
        docPath: "/vue",
        summary:
          "A Node Copilot Runtime with a `default` BuiltInAgent, and a Vue app whose CopilotKitProvider points at it and renders CopilotChat.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: streamed reply from the default agent.",
      },
    ],
  },
  {
    title: "Basics",
    routes: [
      {
        path: "/prebuilt-components",
        hasDemo: true,
        folder: "Prebuilt Components",
        title: "Prebuilt Components",
        docPath: "/vue/prebuilt-components",
        summary: "CopilotChat, CopilotSidebar and CopilotPopup as tabs over one agent, plus starter suggestions.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: all three surfaces answer and share the conversation.",
      },
      {
        path: "/prebuilt-components/chat",
        hasDemo: true,
        folder: "Prebuilt Components",
        title: "CopilotChat",
        docPath: "/vue/prebuilt-components/chat",
        summary: "The inline chat surface with its documented props (labels, welcome-screen, auto-scroll, on-error) and events.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: events logged, custom labels applied.",
      },
      {
        path: "/prebuilt-components/sidebar",
        hasDemo: true,
        folder: "Prebuilt Components",
        title: "CopilotSidebar",
        docPath: "/vue/prebuilt-components/sidebar",
        summary: "A docked, collapsible chat with a custom header slot.",
        status: "partial",
        statusNote: "Works, but the doc's header slot props (toggle/open/close) do not exist; 1.87.0 passes {title, onClose, isOpen}.",
      },
      {
        path: "/prebuilt-components/popup",
        hasDemo: true,
        folder: "Prebuilt Components",
        title: "CopilotPopup",
        docPath: "/vue/prebuilt-components/popup",
        summary: "A floating launcher that opens an overlay chat, sized and closable on outside click.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model.",
      },
      {
        path: "/prebuilt-components/chat-controls",
        hasDemo: true,
        folder: "Prebuilt Components",
        title: "Open, close & feedback",
        docPath: "/vue/prebuilt-components/chat-controls",
        summary: "A custom toggle-button slot that opens the popup, and thumbs-up/down feedback events on assistant messages.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: toggle-button slot opens the popup; thumbs-up emits feedback.",
      },
      {
        path: "/custom-look-and-feel/slots",
        hasDemo: true,
        folder: "Custom Look and Feel",
        title: "Slots",
        docPath: "/vue/custom-look-and-feel/slots",
        summary: "Replacing chat sub-components with Vue named and scoped slots, up to three levels deep.",
        status: "partial",
        statusNote: "7 of 8 samples work. The disclaimer sample never renders: the input slot props do not include showDisclaimer.",
      },
      {
        path: "/custom-look-and-feel/headless-ui",
        hasDemo: true,
        folder: "Custom Look and Feel",
        title: "Fully Headless UI",
        docPath: "/vue/custom-look-and-feel/headless-ui",
        summary: "A chat built on useAgent and useCopilotKit with no CopilotChat shell, plus the public-leaves variant.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: minimal and complete variants.",
      },
      {
        path: "/programmatic-control",
        hasDemo: true,
        folder: "Custom Look and Feel",
        title: "Programmatic Control",
        docPath: "/vue/programmatic-control",
        summary: "Driving an agent from a button: addMessage, runAgent, stopAgent, and agent.subscribe lifecycle events.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: started → done, sales summary produced.",
      },
      {
        path: "/inspector",
        hasDemo: true,
        folder: "Custom Look and Feel",
        title: "Inspector",
        docPath: "/vue/inspector",
        summary: "The dev-only Inspector overlay, with a frontend tool and context registered so its panes have content.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: overlay mounted, inspector_ping called by the agent.",
      },
      {
        path: "/threads/drawer",
        hasDemo: true,
        folder: "Threads",
        premium: true,
        title: "Threads Drawer",
        docPath: "/vue/prebuilt-components/copilot-threads-drawer",
        summary: "CopilotThreadsDrawer beside CopilotChat under a shared chat configuration, plus the controlled-threadId variant.",
        status: "broken",
        statusNote: "Without a license the drawer never shows the documented locked view; it stays on 'Loading threads…'.",
      },
      {
        path: "/threads/headless",
        hasDemo: true,
        folder: "Threads",
        premium: true,
        title: "Headless Threads",
        docPath: "/vue/headless-threads",
        summary: "A custom thread list over useThreads: switch, rename, archive, delete, paginate.",
        status: "untested",
        statusNote: "Needs an Intelligence-connected runtime; without one useThreads reports that thread endpoints are unavailable.",
      },
      {
        path: "/threads/lifecycle",
        hasDemo: true,
        folder: "Threads",
        title: "Thread History Lifecycle",
        docPath: "/vue/threads-lifecycle",
        summary: "Explicit thread ids, history replay on remount, restoring history with setMessages, and switching threads.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: explicit thread-id stored, replayed on remount, restored with setMessages.",
      },
    ],
  },
  {
    title: "Generative UI",
    routes: [
      missing("/generative-ui/components", "Components and surfaces", "/vue/generative-ui/components", "404", "Declarative", `${DOCS_ROOT}/mastra/generative-ui/components`),
      missing("/generative-ui/components/surfaces", "Surfaces", "/vue/generative-ui/components/surfaces", "404", "Declarative", `${DOCS_ROOT}/generative-ui/components/surfaces`),
      missing("/generative-ui/components/catalogs", "Catalogs", "/vue/generative-ui/components/catalogs", "404", "Declarative", `${DOCS_ROOT}/generative-ui/components/catalogs`),
      missing("/generative-ui/components/standard-catalog", "Standard Catalog", "/vue/generative-ui/components/standard-catalog", "307 → non-Vue page", "Declarative", `${DOCS_ROOT}/generative-ui/components/standard-catalog`),
      missing("/generative-ui/components/state-and-actions", "State and actions", "/vue/generative-ui/components/state-and-actions", "404", "Declarative", `${DOCS_ROOT}/mastra/generative-ui/components/state-and-actions`),
      missing("/generative-ui/components/theming", "Theming", "/vue/generative-ui/components/theming", "404", "Declarative", `${DOCS_ROOT}/generative-ui/components/theming`),
      missing("/generative-ui/components/transports", "Transports", "/vue/generative-ui/components/transports", "404", "Declarative", `${DOCS_ROOT}/generative-ui/components/transports`),
      missing("/generative-ui/components/markdown-mode", "Markdown Mode", "/vue/generative-ui/components/markdown-mode", "404", "Declarative", `${DOCS_ROOT}/generative-ui/components/markdown-mode`),
      missing("/generative-ui/components/from-a2ui", "Adopt from A2UI", "/vue/generative-ui/components/from-a2ui", "404", "Declarative", `${DOCS_ROOT}/generative-ui/components/from-a2ui`),
      missing("/generative-ui/a2ui", "A2UI", "/vue/generative-ui/a2ui", "404", "Declarative › A2UI", `${DOCS_ROOT}/generative-ui/a2ui`),
      missing("/generative-ui/a2ui/fixed-schema", "Fixed Schema A2UI", "/vue/generative-ui/a2ui/fixed-schema", "404", "Declarative › A2UI", `${DOCS_ROOT}/generative-ui/a2ui/fixed-schema`),
      missing("/generative-ui/a2ui/dynamic-schema", "Dynamic Schema A2UI", "/vue/generative-ui/a2ui/dynamic-schema", "404", "Declarative › A2UI", `${DOCS_ROOT}/generative-ui/a2ui/dynamic-schema`),
      missing("/generative-ui/json-render", "JSON Render", "/vue/generative-ui/json-render", "404", "Declarative", `${DOCS_ROOT}/generative-ui/json-render`),
      missing("/generative-ui/hashbrown", "Hashbrown", "/vue/generative-ui/hashbrown", "404", "Declarative", `${DOCS_ROOT}/generative-ui/hashbrown`),
      {
        path: "/generative-ui/mcp-apps",
        hasDemo: true,
        folder: "Open-Ended",
        title: "MCP Apps",
        docPath: "/vue/generative-ui/mcp-apps",
        summary: "An MCP Apps server wired on the runtime; its UI renders inline in the chat with no frontend renderer.",
        status: "untested",
        statusNote: "Needs MCP_APPS_SERVER_URL on the runtime; recorded without one (text reply only).",
      },
      missing("/generative-ui/open-generative-ui", "Open Generative UI", "/vue/generative-ui/open-generative-ui", "404", "Open-Ended", `${DOCS_ROOT}/generative-ui/open-generative-ui`),
      {
        path: "/generative-ui/tool-rendering",
        hasDemo: true,
        folder: "Controlled",
        title: "Tool Rendering",
        docPath: "/vue/generative-ui/tool-rendering",
        summary: "Rendering tool calls: the zero-config default card, a custom catch-all, and a per-tool renderer with fallback.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: WeatherToolCard, default card and BrandedToolCard all render.",
      },
      {
        path: "/generative-ui/tool-based",
        hasDemo: true,
        folder: "Controlled",
        title: "Component as tool",
        docPath: "/vue/generative-ui/tool-based",
        summary: "useComponent registers a Vue component as a tool; the agent calls it and the card renders in the chat.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: WeatherCard rendered by the agent's show_weather call.",
      },
    ],
  },
  {
    title: "App Control",
    routes: [
      {
        path: "/frontend-tools",
        hasDemo: true,
        title: "Frontend Tools",
        docPath: "/vue/frontend-tools",
        summary: "A browser-side tool the agent calls to filter an incident list held in Vue state.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: filter_incidents runs in the browser (sev1, then all).",
      },
    ],
  },
  {
    title: "Shared State",
    routes: [
      {
        path: "/shared-state",
        hasDemo: true,
        title: "Shared State",
        docPath: "/vue/shared-state",
        summary: "Reading and writing agent state from Vue, with the agent updating the same state.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: app → agent and agent → app writes both land.",
      },
      {
        path: "/shared-state/rendering-in-app",
        hasDemo: true,
        title: "Render agent state in your app",
        docPath: "/vue/shared-state/rendering-in-app",
        summary: "A canvas that seeds agent state, renders it, and writes back on click.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: the agent renamed the canvas and added an item.",
      },
      {
        path: "/shared-state/agent-readonly",
        hasDemo: true,
        title: "Agent Read-Only Context",
        docPath: "/vue/shared-state/agent-readonly",
        summary: "useAgentContext exposes a reactive value the agent can read but not change.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: the agent follows the context value as it changes.",
      },
    ],
  },
  {
    title: "Human In The Loop",
    routes: [
      {
        path: "/human-in-the-loop",
        hasDemo: true,
        title: "HITL Overview",
        docPath: "/vue/human-in-the-loop",
        summary: "useHumanInTheLoop: the agent pauses on a tool call until the user picks a meeting time.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: time picker rendered, choice resumed the run.",
      },
      {
        path: "/human-in-the-loop/governed-actions",
        hasDemo: true,
        title: "Governed Action Approval UI",
        docPath: "/vue/human-in-the-loop/governed-actions",
        summary: "Approval UI for side-effect actions, via useInterrupt and via useHumanInTheLoop.",
        status: "partial",
        statusNote: "useHumanInTheLoop approval works. The useInterrupt pattern cannot render with BuiltInAgent: its interrupts carry no metadata.action.",
      },
    ],
  },
  {
    title: "Built-in Agent",
    routes: [
      missing("/built-in-agent/server-tools", "Server Tools", "/vue/built-in-agent/server-tools", "307 → /vue/server-tools → 404", undefined, `${DOCS_ROOT}/server-tools`),
      missing("/built-in-agent/mcp-servers", "MCP servers", "/vue/built-in-agent/mcp", "307 → /vue/mcp → 404"),
      missing("/built-in-agent/advanced-configuration", "Advanced Configuration", "/vue/built-in-agent/advanced-configuration", "404"),
      missing("/built-in-agent/model-selection", "Model Selection", "/vue/built-in-agent/model-selection", "307 → /vue/model-selection → 404", "Model Selection", `${DOCS_ROOT}/model-selection`),
      missing("/built-in-agent/model-selection/openai", "OpenAI", "/vue/built-in-agent/model-selection/openai", "404", "Model Selection"),
      missing("/built-in-agent/model-selection/anthropic", "Anthropic", "/vue/built-in-agent/model-selection/anthropic", "404", "Model Selection"),
      missing("/built-in-agent/model-selection/google", "Google", "/vue/built-in-agent/model-selection/google", "404", "Model Selection"),
    ],
  },
  {
    title: "Runtime",
    routes: [
      {
        path: "/backend/copilot-runtime",
        hasDemo: true,
        title: "Copilot Runtime",
        docPath: "/vue/backend/copilot-runtime",
        summary: "What the runtime registers (/info) and a direct AG-UI connection through agents__unsafe_dev_only.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: /info agent map and the direct HttpAgent connection.",
      },
      {
        path: "/backend/runtime-endpoints",
        hasDemo: true,
        title: "Runtime HTTP endpoints",
        docPath: "/vue/backend/runtime-endpoints",
        summary: "Every multi-route endpoint called from the browser, with the raw status and body.",
        status: "partial",
        statusNote: "Run, connect, stop and thread-history routes work. GET /threads and POST /threads/clear return 403, contrary to the doc.",
      },
      {
        path: "/backend/custom-agent",
        hasDemo: true,
        title: "Use any model router",
        docPath: "/vue/backend/custom-agent",
        summary: "BuiltInAgent factory mode: a scripted `custom` agent and an AI SDK `aisdk` agent.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: both the custom and aisdk factory agents answer.",
      },
      {
        path: "/backend/agent-runner",
        hasDemo: true,
        title: "AgentRunner and persistence",
        docPath: "/vue/backend/agent-runner",
        summary: "A bounded InMemoryAgentRunner, and reading back exactly what it stored for a thread.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: the runner returns the stored thread history.",
      },
      {
        path: "/backend/ag-ui",
        hasDemo: true,
        title: "Connect AG-UI agents",
        docPath: "/vue/backend/ag-ui",
        summary: "agent.subscribe with every documented callback, and the client-side proxy agent.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: every subscriber callback fires; frontend agent is a ProxiedCopilotRuntimeAgent.",
      },
      missing("/backend/authentication", "Authentication", "/vue/auth", "404", undefined, `${DOCS_ROOT}/mastra/auth`),
      {
        path: "/multi-agent/subagents",
        hasDemo: true,
        title: "SubAgents",
        docPath: "/vue/multi-agent/subagents",
        summary: "A supervisor delegating to research, writing and critique sub-agents, with a live delegation log.",
        status: "working",
        statusNote: "Verified 2026-11-12 by the autorecorder with a live model: research → writing → critique delegations, then a final answer. Ported from a Python-only sample.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    routes: [
      {
        path: "/troubleshooting",
        title: "Known issues & notes",
        docPath: "/vue/troubleshooting/common-issues",
        summary: "Common issues mapped to this repo, and every doc-vs-package discrepancy found.",
        status: "reference",
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}
