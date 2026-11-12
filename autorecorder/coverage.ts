/**
 * Does the recorder cover every demo the app ships, in the app's nav order?
 *
 *   npm run coverage        exit 1 on a missing, extra, or out-of-order page
 *
 * The recorder registry (`config/pages.config.ts`) is meant to mirror every
 * `hasDemo: true` route in `frontend/src/lib/nav-config.ts`. Nothing enforced
 * that: the 2026-10-30 doc sync added 26 demo routes to the app and none to
 * the recorder, and `npm run doctor` stayed green because it only validates
 * the pages that *are* registered. This closes that gap.
 *
 * A sibling of cli.ts, like manifest.ts, because cli.ts and core/doctor.ts are
 * frozen. The check is worth promoting into the doctor: every framework repo
 * has a nav config of some kind and the same blind spot.
 *
 * nav-config.ts has no imports, so it is loaded directly — the app's own data,
 * not a regex over its source.
 */

import { NAV } from '../frontend/src/lib/nav-config';
import { PAGES } from './config/pages.config';

const trim = (p: string) => p.replace(/^\/+|\/+$/g, '');

const navDemos = NAV.flatMap((g) => g.routes)
  .filter((r) => r.hasDemo)
  .map((r) => ({ route: trim(r.path), title: r.title }));

const registered = PAGES.map((p) => trim(p.route));
const navSet = new Set(navDemos.map((r) => r.route));
const regSet = new Set(registered);

const missing = navDemos.filter((r) => !regSet.has(r.route));
const extra = registered.filter((r) => !navSet.has(r));

// Order: compare the registry against nav order over the routes both share.
const shared = navDemos.map((r) => r.route).filter((r) => regSet.has(r));
const regShared = registered.filter((r) => navSet.has(r));
const firstOutOfOrder = shared.findIndex((r, i) => regShared[i] !== r);

console.log(`\n=== RECORDER COVERAGE ===`);
console.log(`  nav demo routes : ${navDemos.length}`);
console.log(`  registered      : ${registered.length}\n`);

for (const r of missing) console.log(`  [x] not registered: /${r.route}  (${r.title})`);
for (const r of extra) console.log(`  [x] registered but not a hasDemo route in nav-config: /${r}`);
if (firstOutOfOrder >= 0) {
  console.log(
    `  [x] out of nav order from /${shared[firstOutOfOrder]} ` +
      `(registry has /${regShared[firstOutOfOrder]} there) — video numbering follows the registry`,
  );
}

const failed = missing.length > 0 || extra.length > 0 || firstOutOfOrder >= 0;
console.log(failed ? `\n  Coverage is incomplete.\n` : `  [ok] Every demo route is registered, in nav order.\n`);
process.exit(failed ? 1 : 0);
