/**
 * Page scripts for the Vue harness, as step lists (see steps.ts).
 *
 * Each was written against that page's own markup in
 * `frontend/src/routes/<route>/demo-chat/DemoChat.vue` — the tab labels it
 * clicks, the `data-testid`s it requires — not adapted from a React page that
 * merely looked similar. `expect` is the proof the page's feature happened;
 * `note` is evidence that depends on the model or on optional configuration.
 *
 * Prompt indexes refer to the page's `prompts[]` in config/pages.config.ts.
 */

import { sleep } from '../core/overlays/cursor';
import { getAssistantMessageCount, waitForAgentResponseCompletion } from '../core/actions';
import { stepsHandler } from './steps';
import { humanClickLocator, humanSelect } from './drive';

const REPLY = '[data-testid="copilot-assistant-message"]';

// ── Basics ─────────────────────────────────────────────────────────────────

export const runPrebuiltAction = stepsHandler('Prebuilt Components', [
  { variant: 'CopilotChat', prompt: 0 },
  { variant: 'CopilotSidebar', prompt: 1 },
  { variant: 'CopilotPopup', prompt: 2 },
]);

export const runChatAction = stepsHandler('CopilotChat', [
  {
    label: 'props + events',
    prompt: 0,
    expect: { selector: '[data-testid="chat-events"]:has-text("submit-message")', why: 'the @submit-message event never reached the log' },
    focus: '[data-testid="chat-events"]',
  },
]);

export const runSidebarAction = stepsHandler('CopilotSidebar', [
  {
    label: 'custom header slot',
    expect: { selector: '[data-testid="sidebar-custom-header"]', why: 'the header slot was not rendered' },
    note: { selector: 'text=✗ close not provided', why: 'documented `close` slot prop is missing (known discrepancy)' },
    focus: '[data-testid="sidebar-custom-header"]',
    prompt: 0,
  },
]);

export const runChatControlsAction = stepsHandler('Open, close & feedback', [
  {
    label: 'feedback',
    prompt: 0,
    run: async (page) => {
      // Thumbs controls sit in the reply's toolbar; hover reveals them.
      const reply = page.locator(REPLY).last();
      await reply.hover().catch(() => {});
      const thumbs = page.getByRole('button', { name: /thumbs up|good response|like/i }).last();
      if (await thumbs.isVisible().catch(() => false)) {
        await humanClickLocator(page, thumbs, { timeoutMs: 5000 });
        await sleep(800);
      } else {
        console.warn('   ⚠️ no thumbs-up control found on the reply');
      }
    },
    note: { selector: '[data-testid="feedback-log"]:has-text("feedback")', why: 'thumbs-up feedback event logged' },
  },
  {
    label: 'custom toggle-button slot',
    clickSelectors: ['[data-testid="custom-toggle"]'],
    expect: { selector: '[data-testid="custom-toggle"]:has-text("Close chat")', why: 'the toggle-button slot did not open the popup' },
    waitMs: 1500,
  },
]);

export const runSlotsAction = stepsHandler('Slots', [
  {
    variant: 'Welcome screen',
    expect: { selector: '[data-testid="custom-welcome"]', why: 'the welcome-screen slot did not render' },
    thenClicks: ['Show my open tickets'],
    run: async (page, config) => {
      await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 2000, 0);
    },
  },
  { variant: 'Assistant message', prompt: 0, expect: { selector: '[data-testid="reviewed-badge"]', why: 'toolbar-items slot did not render the Reviewed badge' } },
  { variant: 'Props override', prompt: 1, expect: { selector: '[data-testid="message-view"].my-custom-messages', why: 'props/classes were not applied to the message view' } },
  {
    variant: 'Custom component',
    prompt: 2,
    messageSelector: '.custom-message[data-role="assistant"]',
    expect: { selector: '.custom-message[data-role="assistant"]', why: 'CustomMessageView did not render the reply' },
  },
  { variant: 'Nested: 2 levels', prompt: 3, expect: { selector: '[data-testid="star-action"]', why: 'two-level toolbar slot did not render' } },
  { variant: 'Nested: 3 levels', prompt: 4, expect: { selector: '[data-testid="copy-response"]', why: 'three-level copy-button slot did not render' } },
  {
    variant: 'Labels',
    noChat: true,
    expect: { selector: 'textarea[placeholder="Ask your agent anything…"]', why: 'labels prop did not change the placeholder' },
  },
  // Last on purpose: the doc's sample binds the input slot props, which do not
  // include `showDisclaimer`, so CopilotChatInput never renders the slot
  // (known discrepancy). Kept as a hard check so the run reports it, after
  // every other tab has been filmed.
  {
    variant: 'Disclaimer',
    noChat: true,
    expect: { selector: '[data-testid="custom-disclaimer"]', why: 'disclaimer slot did not render — CopilotChatInput needs showDisclaimer, which the input slot props do not pass (README known issue)', timeoutMs: 5000 },
  },
]);

export const runHeadlessUiAction = stepsHandler('Headless UI', [
  {
    variant: 'Minimal',
    prompt: 0,
    inputSelector: 'input[aria-label="Message"]',
    messageSelector: '.headless-message[data-role="assistant"]',
    expect: { selector: '.headless-message[data-role="assistant"]', why: 'the headless chat never showed an assistant message' },
  },
  {
    variant: 'Complete',
    noChat: true,
    // :has-text — with a tool call the first assistant message is the empty,
    // zero-height tool-call row; the answer is the next one.
    expect: { selector: `${REPLY}:has-text("Oslo")`, why: 'CopilotChatMessageView did not render the same conversation' },
    focus: `${REPLY}:has-text("Oslo")`,
  },
]);

export const runProgrammaticAction = stepsHandler('Programmatic Control', [
  {
    label: 'Run agent',
    clicks: ['Run agent'],
    expect: [
      { selector: '[data-testid="lifecycle-log"]:has-text("started")', why: 'onRunStartedEvent never fired' },
      { selector: '[data-testid="lifecycle-log"]:has-text("done")', why: 'the run never finalized', timeoutMs: 60000 },
      { selector: '[data-testid="sales-messages"] [data-role="assistant"]', why: 'the sales agent produced no assistant message' },
    ],
    focus: '[data-testid="sales-messages"]',
  },
]);

export const runInspectorAction = stepsHandler('Inspector', [
  {
    label: 'ping + inspector',
    prompt: 0,
    note: { selector: '[data-testid="ping-count"]:text-matches("^[1-9]")', why: 'inspector_ping was called' },
    expect: { selector: 'cpk-web-inspector', why: 'the Inspector overlay is not mounted in dev', timeoutMs: 10000 },
  },
]);

// ── Threads ────────────────────────────────────────────────────────────────

export const runThreadsDrawerAction = stepsHandler('Threads Drawer', [
  {
    variant: 'Shared configuration',
    prompt: 0,
    expect: { selector: 'copilotkit-threads-drawer', why: 'the drawer web component did not mount' },
    note: { selector: 'copilotkit-threads-drawer >> text=Upgrade', why: 'the documented locked view (expected without a license)' },
  },
  { variant: 'Controlled threadId', noChat: true, expect: { selector: 'copilotkit-threads-drawer', why: 'the controlled drawer did not mount' } },
]);

export const runHeadlessThreadsAction = stepsHandler('Headless Threads', [
  {
    label: 'useThreads sidebar',
    prompt: 0,
    expect: { selector: '[data-testid="thread-sidebar"]', why: 'the ThreadSidebar did not render' },
    note: { selector: '[data-testid="threads-error"]', why: 'useThreads reports no thread endpoints (expected without Intelligence)' },
    focus: '[data-testid="thread-sidebar"]',
  },
]);

export const runThreadsLifecycleAction = stepsHandler('Thread Lifecycle', [
  { label: 'explicit thread-id', prompt: 0, inputSelector: '[data-testid="explicit-chat"] textarea' },
  {
    label: 'remount → replay',
    clicks: ['Remount chat'],
    expect: { selector: `[data-testid="explicit-chat"] ${REPLY}`, why: 'history was not replayed after remount', timeoutMs: 20000 },
  },
  {
    label: 'RestoreHistory',
    clicks: ["Use #1's id"],
    expect: { selector: '[data-testid="restore-status"]:text-matches("restored [1-9]")', why: 'RestoreHistory restored no messages' },
    focus: '[data-testid="restore-status"]',
  },
]);

// ── Generative UI ──────────────────────────────────────────────────────────

export const runMcpAppsAction = stepsHandler('MCP Apps', [
  {
    label: 'MCP App',
    prompt: 0,
    awaitReply: false,
    waitMs: 15000,
    note: { selector: 'iframe', why: 'an MCP App iframe (needs MCP_APPS_SERVER_URL)', timeoutMs: 45000 },
  },
]);

export const runToolRenderingAction = stepsHandler('Tool Rendering', [
  {
    variant: 'Per-tool + fallback',
    prompt: 0,
    expect: { selector: '.weather-tool-card', why: 'useRenderTool(get_weather) did not render WeatherToolCard' },
  },
  { variant: 'Default renderer', prompt: 1 },
  {
    variant: 'Custom catch-all',
    prompt: 2,
    expect: { selector: '.branded-tool-card', why: 'the catch-all renderer did not render BrandedToolCard' },
  },
]);

export const runComponentAsToolAction = stepsHandler('Component as tool', [
  {
    label: 'show_weather',
    prompt: 0,
    awaitReply: false,
    waitMs: 4000,
    expect: { selector: '.weather-card', why: 'useComponent(show_weather) never rendered WeatherCard' },
    focus: '.weather-card',
  },
]);

export const runFrontendToolsAction = stepsHandler('Frontend Tools', [
  {
    label: 'filter sev1',
    prompt: 0,
    expect: { selector: '[data-testid="current-filter"]:text-is("sev1")', why: 'filter_incidents handler did not run in the browser' },
    focus: '[data-testid="incident-list"]',
  },
  {
    label: 'filter all',
    prompt: 1,
    expect: { selector: '[data-testid="current-filter"]:text-is("all")', why: 'filter_incidents did not reset the filter' },
  },
]);

// ── Shared State ───────────────────────────────────────────────────────────

export const runSharedStateAction = stepsHandler('Shared State', [
  {
    label: 'app → agent write',
    clicks: ['Prefer concise answers'],
    expect: { selector: '[data-testid="raw-state"]:has-text("concise")', why: 'setState did not update agent.state' },
  },
  {
    label: 'agent → app write',
    prompt: 0,
    expect: { selector: '[data-testid="workspace-notes"] li:has-text("ship")', why: 'the agent did not write the note into shared state' },
  },
  { label: 'agent reads state', prompt: 1, note: { selector: `${REPLY}:has-text("concise")`, why: 'the agent read preferences.tone' } },
]);

export const runRenderingInAppAction = stepsHandler('Render agent state', [
  {
    label: 'agent edits canvas',
    prompt: 0,
    expect: { selector: '.canvas h1:has-text("Vue launch")', why: 'the agent did not update the canvas title through state' },
    note: { selector: '.canvas li:has-text("README")', why: 'the new item appeared' },
    focus: '.canvas',
  },
]);

export const runAgentReadonlyAction = stepsHandler('Agent Read-Only Context', [
  { label: 'read context', prompt: 0, expect: { selector: `${REPLY}:has-text("northstar")`, why: 'the agent did not see the context value' } },
  {
    label: 'change context',
    run: async (page) => {
      await humanSelect(page, '[data-testid="workspace-select"]', 'southwind');
      await sleep(600);
    },
  },
  { label: 'read again', prompt: 1, expect: { selector: `${REPLY}:has-text("southwind")`, why: 'the agent did not see the updated context' } },
]);

// ── Human In The Loop ──────────────────────────────────────────────────────

export const runHitlAction = stepsHandler('HITL', [
  {
    label: 'schedule_meeting',
    prompt: 0,
    awaitReply: false,
    waitMs: 1500,
    expect: { selector: '.time-picker-card button:has-text("Wed 14:30")', why: 'useHumanInTheLoop never rendered the time picker', timeoutMs: 45000 },
    run: async (page, config) => {
      const before = await getAssistantMessageCount(page);
      await humanClickLocator(page, page.getByRole('button', { name: 'Wed 14:30' }).last(), { timeoutMs: 10000 });
      await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 3000, before);
    },
  },
]);

export const runGovernedActionsAction = stepsHandler('Governed actions', [
  {
    label: 'approve_governed_action',
    prompt: 0,
    awaitReply: false,
    waitMs: 1500,
    expect: { selector: '.governed-action-card button:has-text("Approve and run")', why: 'the approval card never rendered', timeoutMs: 45000 },
    note: { selector: '.governed-approval-panel', why: 'useInterrupt panel (expected empty with BuiltInAgent)', timeoutMs: 3000 },
    run: async (page, config) => {
      const before = await getAssistantMessageCount(page);
      await humanClickLocator(page, page.getByRole('button', { name: 'Approve and run' }).last(), { timeoutMs: 10000 });
      await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 3000, before);
    },
  },
]);

// ── Runtime ────────────────────────────────────────────────────────────────

export const runCopilotRuntimeAction = stepsHandler('Copilot Runtime', [
  {
    label: '/info + direct HttpAgent',
    expect: { selector: '[data-testid="agent-table"]:has-text("router-custom")', why: '/info did not list the agents' },
    focus: '[data-testid="agent-table"]',
    prompt: 0,
  },
  { label: 'direct reply', noChat: true, expect: { selector: `${REPLY}:has-text("72°F")`, why: 'the direct AG-UI agent did not answer' } },
]);

export const runRuntimeEndpointsAction = stepsHandler('Runtime endpoints', [
  {
    label: 'endpoints',
    noChat: true,
    clicks: [
      'GET /info',
      'POST /agent/router-custom/run',
      'GET /threads/:id/messages',
      'GET /threads',
      'POST stop (invalid body)',
    ],
    expect: [
      { selector: '.endpoint-result:has-text("POST /agent/router-custom/run"):has-text("200")', why: '/run did not return 200' },
      { selector: '.endpoint-result:has-text("GET /threads/rt-endpoints-demo/messages"):has-text("200")', why: 'thread messages route failed' },
    ],
    note: { selector: '.endpoint-result:has-text("GET /threads "):has-text("403")', why: 'GET /threads → 403 (known discrepancy)' },
    focus: '[data-testid="endpoint-output"]',
  },
]);

export const runModelRouterAction = stepsHandler('Model router', [
  {
    variant: 'type: "custom"',
    prompt: 0,
    expect: [
      { selector: `${REPLY}:has-text("72°F")`, why: 'the custom factory agent did not answer' },
      { selector: '.event-log:has-text("onToolCallStartEvent")', why: 'no TOOL_CALL events reached the subscriber' },
    ],
  },
  { variant: 'type: "aisdk"', prompt: 1 },
]);

export const runAgentRunnerAction = stepsHandler('AgentRunner', [
  { label: 'run on a thread', prompt: 0 },
  {
    label: 'read back',
    clicks: ['messages'],
    expect: { selector: '[data-testid="runner-output"]:has-text("persist me")', why: 'the runner did not store the thread messages' },
    focus: '[data-testid="runner-output"]',
  },
]);

export const runAgUiAction = stepsHandler('AG-UI', [
  {
    variant: 'router-custom',
    prompt: 0,
    expect: [
      { selector: '.event-log:has-text("onRunStartedEvent")', why: 'onRunStartedEvent never fired' },
      { selector: '.event-log:has-text("onRunFinalized")', why: 'onRunFinalized never fired' },
      { selector: '[data-testid="proxy-class"]:has-text("Proxied")', why: 'the frontend agent is not a runtime proxy' },
    ],
    focus: '.event-log',
  },
]);

export const runSubagentsAction = stepsHandler('SubAgents', [
  {
    label: 'delegate',
    prompt: 0,
    awaitReply: false,
    waitMs: 2000,
    expect: { selector: '.delegation-card', why: 'the supervisor never delegated to a sub-agent', timeoutMs: 90000 },
    run: async (page, config) => {
      // Let the supervisor finish all delegations and write its answer.
      await page
        .locator('.delegation-entry .badge:has-text("running")')
        .first()
        .waitFor({ state: 'detached', timeout: 120000 })
        .catch(() => {});
      await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, 0).catch(() => {});
    },
  },
]);
