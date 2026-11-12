# Autorecorder

Automated screen-recording suite for CopilotKit framework integrations. It
produces one narrated-looking demo video per documentation page: read the doc,
switch to VS Code and show the code that implements it, switch to the browser and
drive the live feature.

Configured for **CopilotKit Vue (`@copilotkit/vue`) + BuiltInAgent runtime**: all
28 routes of this repo that have a chrome-free `demo-chat` page, in doc-nav
order. The Vue checklist items with no Vue doc page (A2UI, JSON Render,
Hashbrown, Open Generative UI, the Built-in Agent section, Authentication) and
the reference pages (Introduction, Troubleshooting) have nothing to drive; see
*Scope* below.

> **Porting this to another framework?** Read **[ADAPT.md](ADAPT.md)** first. It
> is written for the person or agent doing the port, and it is the contract the
> `doctor` command enforces. This folder was ported from the React built-in-agent
> repo; `core/`, `cli.ts`, `manifest.ts` and `coverage.ts` are unchanged copies.

---

## Run it

Both services must be up first — the recorder refuses to start otherwise,
because a video of a dead page is worse than no video. Unlike the React
reference, the runtime is a separate Node process (the Vue quickstart's
`server.ts`), so there are two:

```bash
# from the repo root — starts both (runtime :8200, Vite :5173)
npm run dev
```

The runtime needs `OPENAI_API_KEY` (in `backend/.env` or the root `.env`). Without
it every model-backed page fails with "Agent never produced a response".

Then:

```bash
cd autorecorder
npm install
npx playwright install chromium   # used by `doctor --online`; recordings use your installed Chrome

npm run doctor            # is the configuration sane?
npm run coverage          # is every demo route registered, in nav order?
npm run doctor:online     # also probe every doc/demo URL and the selectors
npm run record -- --list  # what will be recorded
npm run record -- --quickstart
npm run record            # all pages, in order
npm run manifest          # straight after recording — see "Tracking recordings"
```

| Flag | Effect |
|---|---|
| `--list`, `--help` | Print every registered route and exit |
| `--doctor` | Validate the configuration; exits 1 on error |
| `--doctor --online` | Also probe every doc/demo URL and the selectors |
| `--<page-id>` | Record one page — `--quickstart`, `--custom-look-and-feel-slots` |
| `--page=<id>` | Same thing, explicit form |
| `--filter=<query>` | Record every page whose id or name contains the query |
| `--force` | Record even if the pre-flight health check fails |

If something else owns the ports, point the recorder elsewhere:

```bash
FRONTEND_URL=http://localhost:5174 BACKEND_URL=http://localhost:8201 npm run doctor:online
```

Videos land in `videos/` as `BUILTIN-vue-<NN>-<name>.webm`, 1920×1080, ~25fps.
Recordings launch your installed Google Chrome (`channel: "chrome"`, headed).

**`videos/` is gitignored on purpose.** Recordings are build output — reproducible
from this folder plus `npm run record` — and committing them is expensive. Publish
them as release assets or to a bucket. Commit only `videos/manifest.json` and
`videos/MANIFEST.md`.

---

## Scope in this repo

A page is recordable only if it has something to drive; the recorder reaches
every demo at `<route>/demo-chat`. The Vue app's nav
(`frontend/src/lib/nav-config.ts`) has 53 entries: 28 with a demo, 23 checklist
items the Vue docs do not have, and 2 reference pages. All 28 demos are
registered, in nav order; `npm run coverage` keeps it that way.

**The list follows the app's nav.** `config/pages.config.ts` mirrors the
`hasDemo: true` routes of `nav-config.ts` in the same order, which is also the
`NN` in each filename. Demo files live at
`frontend/src/routes/<route>/demo-chat/DemoChat.vue`, so the IDE file for any page
follows from its route.

**Line ranges are anchored to code, not typed in.** `config/anchors.ts` resolves
`span(file, '<template>', '</template>')` to line numbers when the config loads,
so a range follows its code when the file is edited. An anchor that disappears
resolves to an invalid range, which the doctor reports against the right page.

**Every page proves its feature, not just a reply.** All handlers are step lists
in `actions/vue.steps.ts`: switch tab, prompt, then *require* the page's own
evidence — a `WeatherToolCard`, the time-picker card, `sev1` in the filter, the
custom `Reviewed` badge, `onRunFinalized` in the event log. A renderer that
silently fell back to markdown still produces an assistant message, so without
that check it would report `[PASS]`. Quickstart and CopilotPopup stay on
`runStandardAction`.

**Selectors are test ids.** `@copilotkit/vue` 1.87.0 renders
`data-testid="copilot-chat-input-textarea"`, `copilot-chat-input-send` and
`copilot-assistant-message`, so `config/selectors.config.ts` needs no class-name
guessing. The headless and custom-message-view demos pass their own selectors.

**No runtime warm-up.** `runtimeWarmPath` is `''`: the runtime is a `tsx` process
that is fully loaded before it listens, on a different origin from the frontend.
`actions/runtime-paths.ts` is kept (adapted to `src/routes` and `.vue`) and finds
nothing to warm.

### Pages that depend on configuration

| Page | Without it |
|---|---|
| every model-backed page | No `OPENAI_API_KEY` → `RUN_ERROR`; the chat shows nothing and the run fails. Model router, AgentRunner, AG-UI and the direct panel on Copilot Runtime use the scripted `router-custom` agent and work without a key. |
| Threads Drawer | No license / Intelligence → the drawer stays on "Loading threads…" (recorded as ❌ in the repo README). Filmed; the locked-view check is a note, not a failure. |
| Headless Threads | No Intelligence → `useThreads` reports "Thread endpoints are not available". Filmed as a note. |
| MCP Apps | No `MCP_APPS_SERVER_URL` on the runtime → a text-only reply; the iframe check is a note. |
| Governed Actions | Pattern A (`useInterrupt`) never renders with BuiltInAgent; only pattern B's approval card is required. |

---

## Tracking recordings

Clips are not in git, and every run overwrites the same filenames in place.
`npm run manifest` writes `videos/manifest.json` and `videos/MANIFEST.md` — per
clip: mtime, size, sha256, the source files it shows, and a hash of those files
plus the page definition. Commit both; the diff is the record of what a run
changed. `npm run manifest:check` exits 1 if anything is stale or missing.

| Status | Means |
|---|---|
| ✅ current | clip matches the code it shows |
| 🆕 new | the clip changed since the last manifest |
| ⚠️ stale | a source file was modified *after* the clip was recorded |
| ⚠️ drifted | source content hash moved although mtimes look fine |
| ❌ missing | a registered page with no clip on disk |

Freshness is not correctness: Playwright saves a video even when a page fails,
so check the run summary (also kept in `videos/last-run.log`) for that.

---

## Reading the summary

- **PASS** — every step completed, including the page's feature checks.
- **PASS\*** — recorded, but the external doc page misbehaved.
- **FAIL** — the demo route 404'd, never rendered a chat surface, the agent never
  answered, or a step's feature check never appeared. The process exits 1.

---

## Layout

```
autorecorder/
├── ADAPT.md                    ← how to port this; read before editing
├── cli.ts                      ← entrypoint (unchanged copy)
├── coverage.ts                 ← nav-config ↔ registry check (unchanged copy)
├── manifest.ts                 ← recording freshness (unchanged copy)
├── config/                     ← ★ THE ADAPTATION SURFACE
│   ├── project.config.ts         slug "vue", doc root, :5173 / :8200, start commands
│   ├── pages.config.ts           28 entries, nav order
│   ├── anchors.ts                span(): line ranges resolved from code text
│   └── selectors.config.ts       @copilotkit/vue data-testids
├── actions/                    ← ★ what to DO on each page
│   ├── index.ts                  page id → handler
│   ├── vue.steps.ts              every Vue page script
│   ├── steps.ts / drive.ts       step runner + click/select helpers (Vue textarea id)
│   ├── page-ready.ts             readiness gate (unchanged)
│   └── runtime-paths.ts          per-page runtime scan (src/routes, .vue)
├── core/                       ← ✖ DO NOT EDIT — unchanged copy of the reference
└── videos/                     ← output (gitignored except the manifest)
```

---

## Findings for `core/` (reported, not changed)

1. **No `.vue` grammar in the IDE simulator.** `core/ide/generator.ts` preloads
   Shiki grammars for tsx/ts/js/json/python/markdown only, so `.vue` files render
   as plain text in the simulated VS Code. Fix: add `'vue'` to `SHIKI_LANGS` and
   map `ext === 'vue'` in `langFor()`. Every Vue/Angular/Svelte port has this gap.
2. **`doctor --online` always launches Playwright's bundled headless Chromium**
   while recordings use the installed Chrome. On machines where downloaded
   binaries cannot execute, the doctor cannot run even though recording works.
3. **Next.js-specific wording** in log/hint strings (`"Waiting for Next.js
   compilation & React hydration"`, `frontend/src/app/` in diagnostics). Harmless,
   but misleading in a Vite app.
