/**
 * Which runtime endpoint(s) a demo page will post to — read from its source.
 *
 * `PROJECT.runtimeWarmPath` covers the shared `/api/copilotkit`, but most of
 * the generative-UI, MCP, threads and auth demos mount a runtime of their own
 * (`/api/copilotkit-ogui`, `/api/copilotkit-mcp-apps`, …). A dev server
 * compiles each of those on its first request — which, without warming, is the
 * recording's first prompt, so it spends its 30s response window compiling and
 * the page fails as "agent never responded".
 *
 * Rather than keep a page→endpoint table that would drift the way the line
 * ranges did, this scans the demo's entry file and follows its local imports
 * (`@/…` and relative) two levels deep, collecting every `/api/copilotkit…`
 * string literal. Two levels reaches the providers that live outside the
 * route folder (`src/a2ui/*\/demo.tsx`, `src/components/threads-provider.tsx`,
 * `src/copilotkit/auth-demo.ts`).
 *
 * Framework-specific only in its default pattern; the logic is generic.
 *
 * In the Vue repo every demo talks to the one standalone runtime on :8200
 * through the root provider, so this finds nothing to warm. It is kept (adapted
 * to src/routes and .vue files) so a future per-page runtime is picked up.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FRONTEND_SRC = join(REPO_ROOT, 'frontend', 'src');
// Vue port: demos live at src/routes/<route>/demo-chat/DemoChat.vue.
const APP_DIR = join(FRONTEND_SRC, 'routes');

const ENDPOINT = /["'`](\/api\/copilotkit[-a-z0-9]*)["'`/]/g;
const IMPORT = /from\s+["']([^"']+)["']/g;
const EXTS = ['', '.vue', '.ts', '/index.ts'];

function resolveImport(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = join(FRONTEND_SRC, spec.slice(2));
  else if (spec.startsWith('.')) base = resolve(dirname(fromFile), spec);
  else return null;
  for (const ext of EXTS) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

function filesIn(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...filesIn(p));
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

const cache = new Map<string, string[]>();

/** Every runtime path the demo at `<route>/demo-chat` references. */
export function runtimePathsFor(route: string, depth = 2): string[] {
  if (cache.has(route)) return cache.get(route)!;

  const demoDir = join(APP_DIR, ...route.split('/').filter(Boolean), 'demo-chat');
  const found = new Set<string>();
  const seen = new Set<string>();
  let frontier = filesIn(demoDir);

  for (let level = 0; level <= depth && frontier.length; level++) {
    const next: string[] = [];
    for (const file of frontier) {
      if (seen.has(file)) continue;
      seen.add(file);
      const src = readFileSync(file, 'utf-8');
      for (const m of src.matchAll(ENDPOINT)) found.add(m[1]);
      for (const m of src.matchAll(IMPORT)) {
        const target = resolveImport(m[1], file);
        if (target && !target.includes('node_modules') && !seen.has(target)) next.push(target);
      }
    }
    frontier = next;
  }

  const paths = [...found].sort();
  cache.set(route, paths);
  return paths;
}
