import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { ALL_ROUTES, demoPath } from "./lib/nav-config";

/**
 * Routes are derived from nav-config, never listed by hand:
 *   - `<path>`            notes & source (RouteNotes, or a bespoke view)
 *   - `<path>/demo-chat`  the live, chrome-free demo
 *
 * Demo components live at `src/routes/<path>/demo-chat/DemoChat.vue`,
 * mirroring the URL, so the file for any demo is found from its path alone
 * (the autorecorder relies on the same convention).
 */
const DEMOS = import.meta.glob("./routes/**/demo-chat/DemoChat.vue");

export function demoFileFor(path: string): string {
  return `./routes${path}/demo-chat/DemoChat.vue`;
}

const BESPOKE: Record<string, () => Promise<unknown>> = {
  "/": () => import("./views/Home.vue"),
  "/troubleshooting": () => import("./views/Troubleshooting.vue"),
};

const records: RouteRecordRaw[] = [{ path: "/status", component: () => import("./views/Status.vue") }];

for (const r of ALL_ROUTES) {
  const notes =
    BESPOKE[r.path] ??
    (r.status === "not-in-docs" ? () => import("./views/NotInVueDocs.vue") : () => import("./views/RouteNotes.vue"));
  records.push({ path: r.path, component: notes as never, props: { path: r.path } });

  const demo = demoPath(r);
  if (demo) {
    const load = DEMOS[demoFileFor(r.path)];
    if (!load) throw new Error(`nav-config marks ${r.path} hasDemo, but ${demoFileFor(r.path)} does not exist`);
    records.push({ path: demo, component: load as never });
  }
}

records.push({ path: "/:pathMatch(.*)*", redirect: "/" });

export const router = createRouter({
  history: createWebHistory(),
  routes: records,
  scrollBehavior: () => ({ top: 0 }),
});
