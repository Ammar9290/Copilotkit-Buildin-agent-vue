# CopilotKit Framework Test App — Build Instructions (Vue)

## Purpose

Build a single frontend application that acts as a **living test harness** for one CopilotKit integration. In this repo, that integration is the **Vue** frontend (`@copilotkit/vue`) backed by a local Copilot Runtime running the `BuiltInAgent`. Every doc page under `https://docs.copilotkit.ai/vue/...` becomes a navigable route in the app, and each route contains a **working, interactive implementation** of what that doc page teaches — not a copy of the doc text.

In this repo, `{framework}` = `vue`.

> Framework-specific deviation from the shared template: the shared template says "Next app". The Vue docs' quickstart prescribes **Vue 3 + Vite** (`npm create vue@latest`) with a separate Node runtime, so this repo's frontend is Vite + Vue 3 + vue-router, not Next.js.

---

## Repo layout — one GitHub repo per framework

Each framework (`agno`, `mastra`, `vue`, etc.) lives in its **own separate GitHub repository**, not a shared monorepo. This `CLAUDE.md` is copied into the root of every one of those repos, so the same process applies everywhere — only `{framework}` (and, where the framework's own quickstart demands it, the frontend scaffold) changes.

```
CPK-Built-In-Agent-Vue/        ← its own git repo
├── CLAUDE.md                   ← this file
├── README.md                    ← elaborate, repo-specific — see "README.md spec" below
├── frontend/                     ← Vite + Vue 3 app; nav = the Vue doc sections
├── backend/                       ← Copilot Runtime (Node + TypeScript, per the Vue quickstart)
├── docs-snapshot/                  ← raw .md of every Vue doc page used, as fetched in Step 0
├── autorecorder/                    ← one demo video per page; read autorecorder/ADAPT.md before editing
└── .env.example
```

Rules:

- Never assume another framework's repo, page list, config shape, or backend language applies to this one — Steps 0–4 always run fresh, scoped to this repo, against this framework's own live doc tree.
- If `CLAUDE.md` itself is improved while working in one framework's repo, port the improvement back to the other framework repos too, so all copies stay in sync.
- `README.md` is the single most important deliverable in each repo — it's what anyone (including future-you) uses to actually run and evaluate the project. Build it to the spec below, not as an afterthought.

---

## Step 0 — Discover the real doc structure first

Doc structure varies per framework and changes over time. Do not assume it matches another framework or an older memory of it.

1. Fetch `https://docs.copilotkit.ai/{framework}` and read the left-nav sidebar.
   - **Improvement (port back to other repos):** the rendered sidebar is only partly recoverable from HTML. Use `https://docs.copilotkit.ai/sitemap.xml` and filter for `/{framework}/` to get the authoritative URL list. Probe each candidate URL and record the HTTP status (200 / 3xx target / 404): redirects matter, e.g. `/vue/threads` → 308 → `/vue/AG-UI-Streams`.
   - **Improvement:** every doc page has a raw Markdown twin at `<url>.md` (e.g. `https://docs.copilotkit.ai/vue/frontend-tools.md`). Fetch those with `curl` into `docs-snapshot/` instead of scraping HTML; that gives exact code samples.
2. Build a checklist from that sidebar (plus any page list the requester provides). Every checklist item gets a route, including items that 404 for this framework; those render a "Not in {framework} docs" page with the probe result.
3. Fetch every page in the checklist before writing code. Do not paraphrase doc prose into the app — extract the *code samples, config shape, and API surface*, and implement the real thing.
4. Note the framework's backend language/runtime from the Quickstart page — this determines your backend scaffold. (Vue: Node 20+, TypeScript via `tsx`, `createCopilotNodeListener` on port 8200, `cors: true`.)
5. Install the exact packages and read their type declarations (`node_modules/@copilotkit/*/dist/**/*.d.ts`) before writing code. Doc samples and the shipped API drift; the `.d.ts` files are the ground truth.

---

## Step 1 — Project scaffolding

- Frontend: **Vue 3 + Vite + TypeScript** (per the Vue quickstart), with `vue-router` for one route per doc page. Components and composables come from `@copilotkit/vue/v2`; styles come from `@copilotkit/vue/styles.css`, imported once in `src/main.ts`.
- Backend: what the Quickstart specifies. For Vue, that is a small Node server: `CopilotRuntime` from `@copilotkit/runtime/v2` served by `createCopilotNodeListener` from `@copilotkit/runtime/v2/node` at `/api/copilotkit`, with `BuiltInAgent` agents registered under the ids the doc samples use.
- `.env.example` for any required keys (model provider key, CopilotKit public license key if used) — never hardcode secrets. (Full run instructions go in `README.md` per the spec in Step 4 — don't duplicate them elsewhere.)

---

## Step 2 — App shell: doc structure = nav structure

- Build a persistent sidebar that mirrors the checklist from Step 0, grouped the same way the docs group it.
- One route per doc page. `frontend/src/lib/nav-config.ts` is the single registry for nav, routes and statuses (no imports: the autorecorder loads it in Node). Each demo route has a notes page at `<path>` and a chrome-free demo at `<path>/demo-chat`, implemented in `frontend/src/routes/<path>/demo-chat/DemoChat.vue`; per-route notes live in `frontend/src/lib/route-notes.ts`.
- The UI mirrors the React built-in-agent harness: sidebar with status dots, route header with "Open demo ↗", panels, Try-it boxes, Shiki code figures, a status overview.
- Each route header shows: page title, a link to the live doc it's testing, and a status badge (Working / Partial / Broken / Untested (needs key) / Not in Vue docs) — this is a QA tool, so make pass/fail state visible at a glance.
- Keep a single shared `CopilotKitProvider` at the app root pointing at your local runtime, so agent state/chat persists sensibly as you navigate between test pages where that's expected (and mount an isolated provider where the doc page specifically demonstrates one).

---

## Step 3 — Implement each section as a real, testable feature

For every route, build the actual functioning example from that doc page, not a static description:

- **Quickstart** — the minimal working chat-with-agent flow exactly as the doc's code sample shows.
- **Prebuilt Components** — render each prebuilt component the doc lists (`CopilotChat`, `CopilotPopup`, `CopilotSidebar`) so all can be exercised.
- **Threads** — implement the drawer, headless thread list (`useThreads`), and thread lifecycle (explicit `threadId`, hydration, `setMessages`, thread switching).
- **Custom Look and Feel** — implement whatever the framework's current pages cover (slots, headless UI, programmatic control, inspector). Actually swap in custom slot components, don't just show config.
- **Generative UI** — tool rendering, components-as-tools, and MCP Apps, each driven by an actual agent tool call.
- **App Control / Frontend Tools** — register at least one real frontend tool the agent can call and show its effect in the UI.
- **Shared State / HITL** — real `setState` round trips; real `useHumanInTheLoop` / `useInterrupt` flows.
- **Runtime** — don't just describe the runtime; show panels that surface raw AG-UI events and raw endpoint responses so behavior is inspectable during testing.
- **Troubleshooting pages** — turn these into an in-app "known issues / migration notes" panel rather than a live feature.
- **Premium (Intelligence) features** — implement what's feasible without a paid account, and clearly mark anything that requires CopilotKit Intelligence.

---

## Step 4 — Build the repo's README.md to this spec

This README is the front door of the repo — someone should be able to clone it, follow the README alone (no other context), get the app running, and know exactly what they should see at each step. Structure:

1. **Header** — title `CopilotKit + {Framework} Test Suite`, one-line description, status line (doc-sync date, CopilotKit package versions).
2. **Overview** — 2–4 sentences; link to `https://docs.copilotkit.ai/{framework}`.
3. **Architecture** — frontend ↔ runtime ↔ agent ↔ model provider; backend language for this framework.
4. **Prerequisites** — exact versions, required keys, CLI tools.
5. **Setup** — copy-pasteable steps; every env var explained; default ports.
6. **Running the project** — exact commands, what successful startup looks like, the URL to open.
7. **What to expect — walkthrough per section** — for every route: path, what it demonstrates, an example interaction, success vs. failure.
8. **Testing checklist / current status** — table: Doc page | Route | Status | Notes. The living QA record.
9. **Known issues / doc-vs-implementation discrepancies** — link the doc page and describe the drift plainly.
10. **Troubleshooting** — translated from the framework's troubleshooting pages into this repo's actual symptoms/fixes.
11. **Project structure** — brief tree of `frontend/` and `backend/`.
12. **References** — every doc page tested, grouped like the doc nav.

---

## Guardrails

- Always re-fetch the live doc page rather than relying on memory of CopilotKit's API — this project moves fast and page structure/APIs change between versions.
- Don't reproduce doc prose verbatim in code comments or in-app text; summarize in your own words and link to the source doc.
- Keep this repo self-contained — no imports from or references to another framework's repo.
- If a doc page 404s or a nav item is missing for this framework, note it in the README's status table (Step 4, section 8) rather than guessing at content from another framework's version of that page.
- **Keep broken things broken (port back to other repos).** Implement what the doc says. When the package does not behave as documented, do **not** patch the library, monkey-patch around it, or quietly "fix" the sample so it passes. Mark the page ❌/⚠️, show the actual behavior in the UI (e.g. render the slot props you actually received), and record the discrepancy in the README and the in-app Troubleshooting panel. The only acceptable adaptations are ones needed to make a sample runnable at all (e.g. a TypeScript cast where the runtime works but the published types reject the doc sample); each one gets a comment and a Known-issues entry.
- Statuses must be evidence-based: "Working" means it was exercised end to end; anything that needs a key or a paid service and wasn't exercised is "Untested", not "Working".

## Autorecorder

- After adding or removing a demo route, register it in `autorecorder/config/pages.config.ts` (nav order) and run `npm run doctor` and `npm run coverage` in `autorecorder/`; both must exit 0.
- A page's status is only ✅ once it was exercised end to end; the autorecorder's feature checks (`actions/vue.steps.ts`) are the evidence. Update `nav-config.ts` and the README §8 table together.
- Never edit `autorecorder/core/`; report core gaps in the README instead.
