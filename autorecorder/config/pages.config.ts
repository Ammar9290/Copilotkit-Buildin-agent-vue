/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 3 of 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One entry per doc page, in the order the doc nav lists them.
 *
 * Entries are deliberately short. `docUrl`, `demoUrl` and the output filename
 * are derived from `project.config.ts` plus the fields below, so no entry can
 * point at the wrong framework's docs and filenames stay in nav order without
 * anyone numbering them by hand.
 *
 * ── Where this list came from ──────────────────────────────────────────────
 * `frontend/src/lib/nav-config.ts`, the Vue app's single source of truth for
 * route → doc page. Every route with `hasDemo: true` is registered here, in nav
 * order: 28 as of the 2026-11-12 doc sync. Checklist items the Vue docs do not
 * have (A2UI, JSON Render, Hashbrown, Open Generative UI, the Built-in Agent
 * section, Authentication) have no demo route and are deliberately absent, as
 * are the reference pages (Introduction, Troubleshooting). `npm run coverage`
 * fails if a `hasDemo` route is missing from here or out of order.
 *
 * `docPath` is relative to `PROJECT.docBaseUrl` (https://docs.copilotkit.ai/vue);
 * `route` mirrors the app's URL, and its demo lives at
 * `frontend/src/routes/<route>/demo-chat/DemoChat.vue`.
 *
 * ── The line ranges ────────────────────────────────────────────────────────
 * Resolved from code text by `span()` (see `anchors.ts`) so they follow the
 * code when a file is edited. `npm run doctor` checks every range.
 *
 * ── Known core gap ─────────────────────────────────────────────────────────
 * `core/ide/generator.ts` preloads Shiki grammars for tsx/ts/js/json/python/
 * markdown only, so `.vue` files appear in the simulated IDE as plain
 * (unhighlighted) text. The fix is one grammar in frozen `core/` and is
 * reported in the README rather than made here.
 */

import { definePages, type IdeTabConfig, type PageDefinition } from '../core/types';
import { span } from './anchors';

/** First tab becomes `ideFile`, the rest `extraTabs`. */
function ide(main: IdeTabConfig, ...extra: IdeTabConfig[]) {
  return {
    ideFile: main.filePath,
    startLine: main.startLine,
    endLine: main.endLine,
    ...(extra.length ? { extraTabs: extra } : {}),
  };
}

const ROUTES = 'frontend/src/routes';
const DEMOS = 'frontend/src/demos';
const demo = (route: string) => `${ROUTES}/${route}/demo-chat/DemoChat.vue`;
const AGENTS = 'backend/agents/index.ts';
const SERVER = 'backend/server.ts';

/** The template block of a Vue SFC — what the page renders. */
const template = (file: string) => span(file, '<template>', /^<\/template>/);
/** The script-setup block of a Vue SFC — what the page wires up. */
const script = (file: string) => span(file, '<script setup', '</script>');
/** One agent's constructor in backend/agents/index.ts. */
const agent = (key: string) => span(AGENTS, `${key}: new BuiltInAgent(`);

/**
 * Every recording ends on the dependency list, so a clip always shows which
 * @copilotkit/vue and @ag-ui versions it worked against. Quickstart opens on
 * it instead (ADAPT.md: the quickstart leads with the dependency manifest).
 */
const PACKAGE_JSON = 'frontend/package.json';
const PACKAGE_JSON_TAB = span(PACKAGE_JSON, '"dependencies": {');

function withPackageJson(defs: PageDefinition[]): PageDefinition[] {
  return defs.map((def) => {
    const alreadyShown =
      def.ideFile === PACKAGE_JSON || (def.extraTabs ?? []).some((tab) => tab.filePath === PACKAGE_JSON);
    if (alreadyShown) return def;
    return { ...def, extraTabs: [...(def.extraTabs ?? []), PACKAGE_JSON_TAB] };
  });
}

const PAGE_DEFS: PageDefinition[] = [
  // ── Getting Started ───────────────────────────────────────────────────────
  {
    id: 'quickstart',
    name: 'Getting Started - Quickstart',
    videoName: 'Quickstart',
    docPath: '',
    route: 'quickstart',
    ...ide(
      PACKAGE_JSON_TAB,
      template(demo('quickstart')),
      span('frontend/src/App.vue', '<CopilotKitProvider', '</CopilotKitProvider>'),
      span(SERVER, 'const runtime = new CopilotRuntime', /^\}\);/),
    ),
    prompt: 'Can you tell me a joke?',
    waitAfterPromptMs: 4000,
  },

  // ── Basics › Prebuilt Components ─────────────────────────────────────────
  {
    id: 'prebuilt-components',
    name: 'Basics - Prebuilt Components',
    videoName: 'PrebuiltComponents',
    docPath: 'prebuilt-components',
    route: 'prebuilt-components',
    ...ide(template(demo('prebuilt-components')), script(`${DEMOS}/prebuilt/Suggestions.vue`)),
    // One per surface; they share `my-agent`, so the conversation carries over.
    prompt: 'Can you tell me a joke?',
    prompts: ['Can you tell me a joke?', 'Now give me one fun fact about the ocean.', 'And one short travel tip, please.'],
    waitAfterPromptMs: 2500,
  },
  {
    id: 'prebuilt-components-chat',
    name: 'Basics - CopilotChat',
    videoName: 'CopilotChat',
    docPath: 'prebuilt-components/chat',
    route: 'prebuilt-components/chat',
    ...ide(span(demo('prebuilt-components/chat'), '<CopilotChat', '/>')),
    prompt: 'Give me three tips for writing Vue composables.',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'prebuilt-components-sidebar',
    name: 'Basics - CopilotSidebar',
    videoName: 'CopilotSidebar',
    docPath: 'prebuilt-components/sidebar',
    route: 'prebuilt-components/sidebar',
    ...ide(span(demo('prebuilt-components/sidebar'), '<CopilotSidebar', '</CopilotSidebar>')),
    prompt: 'Summarise what a sidebar copilot is good for, in two sentences.',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'prebuilt-components-popup',
    name: 'Basics - CopilotPopup',
    videoName: 'CopilotPopup',
    docPath: 'prebuilt-components/popup',
    route: 'prebuilt-components/popup',
    ...ide(template(demo('prebuilt-components/popup'))),
    prompt: 'Tell me a two-line poem about popups.',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'prebuilt-components-chat-controls',
    name: 'Basics - Open, close & feedback',
    videoName: 'ChatControls',
    docPath: 'prebuilt-components/chat-controls',
    route: 'prebuilt-components/chat-controls',
    ...ide(
      span(demo('prebuilt-components/chat-controls'), '<CopilotChat agent-id', '</CopilotChat>'),
      span(demo('prebuilt-components/chat-controls'), '<CopilotPopup', '</CopilotPopup>'),
    ),
    prompt: 'Give me a one-sentence productivity tip.',
    waitAfterPromptMs: 2500,
  },

  // ── Basics › Custom Look and Feel ────────────────────────────────────────
  {
    id: 'custom-look-and-feel-slots',
    name: 'Basics - Slots',
    videoName: 'Slots',
    docPath: 'custom-look-and-feel/slots',
    route: 'custom-look-and-feel/slots',
    ...ide(
      span(demo('custom-look-and-feel/slots'), '<!-- welcome-screen slot -->', '<!-- labels prop -->'),
      template(`${DEMOS}/slots/CustomMessageView.vue`),
    ),
    // [0] assistant toolbar, [1] props override, [2] custom component,
    // [3] two levels, [4] three levels.
    prompt: 'Can you tell me a joke?',
    prompts: [
      'Can you tell me a joke?',
      'Give me one fun fact about Vue.',
      'Say hello in exactly five words.',
      'Name one benefit of scoped slots.',
      'What is a composable, in one sentence?',
    ],
    waitAfterPromptMs: 2000,
  },
  {
    id: 'custom-look-and-feel-headless-ui',
    name: 'Basics - Fully Headless UI',
    videoName: 'HeadlessUI',
    docPath: 'custom-look-and-feel/headless-ui',
    route: 'custom-look-and-feel/headless-ui',
    ...ide(script(`${DEMOS}/headless/HeadlessChat.vue`), template(`${DEMOS}/headless/RenderedMessages.vue`)),
    prompt: 'What is the weather in Oslo?',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'programmatic-control',
    name: 'Basics - Programmatic Control',
    videoName: 'ProgrammaticControl',
    docPath: 'programmatic-control',
    route: 'programmatic-control',
    ...ide(script(`${DEMOS}/programmatic/AgentTrigger.vue`), agent('sales')),
    prompt: 'Summarize the latest sales data',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'inspector',
    name: 'Basics - Inspector',
    videoName: 'Inspector',
    docPath: 'inspector',
    route: 'inspector',
    ...ide(script(demo('inspector'))),
    prompt: 'Call inspector_ping twice, then tell me the count.',
    waitAfterPromptMs: 3000,
  },

  // ── Basics › Threads ─────────────────────────────────────────────────────
  {
    id: 'threads-drawer',
    name: 'Basics - Threads Drawer',
    videoName: 'ThreadsDrawer',
    docPath: 'prebuilt-components/copilot-threads-drawer',
    route: 'threads/drawer',
    ...ide(
      span(demo('threads/drawer'), '<CopilotChatConfigurationProvider v-if', '</CopilotChatConfigurationProvider>'),
      template(`${DEMOS}/threads/ControlledChat.vue`),
    ),
    prompt: 'Hi, I need help with my order.',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'threads-headless',
    name: 'Basics - Headless Threads',
    videoName: 'HeadlessThreads',
    docPath: 'headless-threads',
    route: 'threads/headless',
    ...ide(script(`${DEMOS}/threads/ThreadSidebar.vue`), template(demo('threads/headless'))),
    prompt: 'Start a thread about Vue reactivity.',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'threads-lifecycle',
    name: 'Basics - Thread History Lifecycle',
    videoName: 'ThreadsLifecycle',
    docPath: 'threads-lifecycle',
    route: 'threads/lifecycle',
    ...ide(
      span(demo('threads/lifecycle'), '<CopilotChat :key', 1),
      script(`${DEMOS}/threads/RestoreHistory.vue`),
      template(`${DEMOS}/threads/ThreadControls.vue`),
    ),
    prompt: "Remember the word 'lantern' and confirm in one sentence.",
    waitAfterPromptMs: 2500,
  },

  // ── Generative UI ────────────────────────────────────────────────────────
  {
    id: 'generative-ui-mcp-apps',
    name: 'Generative UI - MCP Apps',
    videoName: 'McpApps',
    docPath: 'generative-ui/mcp-apps',
    route: 'generative-ui/mcp-apps',
    ...ide(span(SERVER, 'mcpAppsUrl', /^\s*: \{\}\),/, { after: 'const runtime = new CopilotRuntime' }), template(demo('generative-ui/mcp-apps'))),
    prompt: 'Draw a simple flowchart of a login process.',
    waitAfterPromptMs: 5000,
  },
  {
    id: 'generative-ui-tool-rendering',
    name: 'Generative UI - Tool Rendering',
    videoName: 'ToolRendering',
    docPath: 'generative-ui/tool-rendering',
    route: 'generative-ui/tool-rendering',
    ...ide(
      script(`${DEMOS}/tool-rendering/PerToolRenderer.vue`),
      template(`${DEMOS}/tool-rendering/WeatherToolCard.vue`),
      span(AGENTS, 'const getWeather = defineTool('),
    ),
    // [0] per-tool + fallback, [1] default renderer, [2] catch-all.
    prompt: 'What is the weather in Tokyo, and roll a d20 for me.',
    prompts: [
      'What is the weather in Tokyo, and roll a d20 for me.',
      'What is the stock price of AAPL?',
      'Find flights to Lisbon.',
    ],
    waitAfterPromptMs: 3000,
  },
  {
    id: 'generative-ui-tool-based',
    name: 'Generative UI - Component as tool',
    videoName: 'ComponentAsTool',
    docPath: 'generative-ui/tool-based',
    route: 'generative-ui/tool-based',
    ...ide(script(`${DEMOS}/component-tool/AgentExperience.vue`), template(`${DEMOS}/component-tool/WeatherCard.vue`)),
    prompt: 'Show me the weather card for Berlin, 18 degrees, cloudy.',
    waitAfterPromptMs: 3000,
  },

  // ── App Control ──────────────────────────────────────────────────────────
  {
    id: 'frontend-tools',
    name: 'App Control - Frontend Tools',
    videoName: 'FrontendTools',
    docPath: 'frontend-tools',
    route: 'frontend-tools',
    ...ide(span(`${DEMOS}/frontend-tools/DashboardAgent.vue`, 'useFrontendTool(', /^\);/)),
    prompt: 'Only show sev1 incidents.',
    prompts: ['Only show sev1 incidents.', 'Show everything again.'],
    waitAfterPromptMs: 2500,
  },

  // ── Shared State ─────────────────────────────────────────────────────────
  {
    id: 'shared-state',
    name: 'Shared State - Shared State',
    videoName: 'SharedState',
    docPath: 'shared-state',
    route: 'shared-state',
    ...ide(script(`${DEMOS}/shared-state/SharedWorkspace.vue`), agent('workspace')),
    prompt: 'Add a note: ship the Vue test suite.',
    prompts: ['Add a note: ship the Vue test suite.', 'What tone do I prefer?'],
    waitAfterPromptMs: 2500,
  },
  {
    id: 'shared-state-rendering-in-app',
    name: 'Shared State - Render agent state in your app',
    videoName: 'RenderingInApp',
    docPath: 'shared-state/rendering-in-app',
    route: 'shared-state/rendering-in-app',
    ...ide(script(`${DEMOS}/shared-state/Canvas.vue`)),
    prompt: 'Rename the project to Vue launch and add an item called Write README.',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'shared-state-agent-readonly',
    name: 'Shared State - Agent Read-Only Context',
    videoName: 'AgentReadonly',
    docPath: 'shared-state/agent-readonly',
    route: 'shared-state/agent-readonly',
    ...ide(script(`${DEMOS}/shared-state/WorkspaceContext.vue`)),
    prompt: 'Which workspace am I in? Answer with just its name.',
    prompts: ['Which workspace am I in? Answer with just its name.', 'And which workspace am I in now? Just the name.'],
    waitAfterPromptMs: 2500,
  },

  // ── Human In The Loop ────────────────────────────────────────────────────
  {
    id: 'human-in-the-loop',
    name: 'HITL - Overview',
    videoName: 'HitlOverview',
    docPath: 'human-in-the-loop',
    route: 'human-in-the-loop',
    ...ide(script(`${DEMOS}/hitl/MeetingApproval.vue`), template(`${DEMOS}/hitl/TimePickerCard.vue`)),
    prompt: 'Schedule a meeting with Dana about the Q4 roadmap.',
    waitAfterPromptMs: 3000,
  },
  {
    id: 'human-in-the-loop-governed-actions',
    name: 'HITL - Governed Action Approval UI',
    videoName: 'GovernedActions',
    docPath: 'human-in-the-loop/governed-actions',
    route: 'human-in-the-loop/governed-actions',
    ...ide(
      script(`${DEMOS}/governed/GovernedActionTool.vue`),
      template(`${DEMOS}/governed/GovernedActionCard.vue`),
      script(`${DEMOS}/governed/GovernedActionApproval.vue`),
    ),
    prompt:
      'Use approve_governed_action to ask me before applying a 20% discount for ACME. Use id act-1, tool apply_discount, reference POL-7, verdict require_approval, arguments {"customer":"ACME","percent":20}.',
    waitAfterPromptMs: 3000,
  },

  // ── Runtime ──────────────────────────────────────────────────────────────
  {
    id: 'backend-copilot-runtime',
    name: 'Runtime - Copilot Runtime',
    videoName: 'CopilotRuntime',
    docPath: 'backend/copilot-runtime',
    route: 'backend/copilot-runtime',
    ...ide(span(SERVER, 'const runtime = new CopilotRuntime', /^\}\);/), script(`${DEMOS}/runtime/DirectAgUi.vue`)),
    prompt: 'Hello direct agent',
    waitAfterPromptMs: 2500,
  },
  {
    id: 'backend-runtime-endpoints',
    name: 'Runtime - Runtime HTTP endpoints',
    videoName: 'RuntimeEndpoints',
    docPath: 'backend/runtime-endpoints',
    route: 'backend/runtime-endpoints',
    ...ide(span(demo('backend/runtime-endpoints'), 'const BUTTONS', /^\];/)),
    prompt: '(no chat — endpoint buttons)',
    waitAfterPromptMs: 2000,
  },
  {
    id: 'backend-custom-agent',
    name: 'Runtime - Use any model router',
    videoName: 'ModelRouter',
    docPath: 'backend/custom-agent',
    route: 'backend/custom-agent',
    ...ide(agent('"router-custom"'), agent('"router-aisdk"')),
    prompt: "What's the weather?",
    prompts: ["What's the weather?", 'Say hello in five words.'],
    waitAfterPromptMs: 2500,
  },
  {
    id: 'backend-agent-runner',
    name: 'Runtime - AgentRunner and persistence',
    videoName: 'AgentRunner',
    docPath: 'backend/agent-runner',
    route: 'backend/agent-runner',
    ...ide(span(SERVER, 'runner: new InMemoryAgentRunner'), script(demo('backend/agent-runner'))),
    prompt: 'persist me',
    waitAfterPromptMs: 2000,
  },
  {
    id: 'backend-ag-ui',
    name: 'Runtime - Connect AG-UI agents',
    videoName: 'AgUi',
    docPath: 'backend/ag-ui',
    route: 'backend/ag-ui',
    ...ide(span('frontend/src/components/EventLog.vue', 'const CALLBACKS = [', /^\] as const;/), span('frontend/src/components/EventLog.vue', 'watch(', /^\);/)),
    prompt: 'hello',
    waitAfterPromptMs: 2500,
  },
  {
    id: 'multi-agent-subagents',
    name: 'Runtime - SubAgents',
    videoName: 'SubAgents',
    docPath: 'multi-agent/subagents',
    route: 'multi-agent/subagents',
    ...ide(agent('subagents'), span(AGENTS, 'async function runSubAgent'), script(demo('multi-agent/subagents'))),
    prompt: 'Write a short paragraph about why Vue composables are useful.',
    waitAfterPromptMs: 4000,
  },
];

export const PAGES = definePages(withPackageJson(PAGE_DEFS));
