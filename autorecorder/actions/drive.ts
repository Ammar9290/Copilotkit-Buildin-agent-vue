/**
 * Small, framework-agnostic driving helpers shared by the handlers in this
 * directory.
 *
 * Every handler written before this file carried its own copy of "find it,
 * glide to its centre, click, fall back to a plain click" — and about half of
 * them also re-implemented "wait for a tab switch to settle". They live here
 * now so a new page's handler is a list of steps rather than a page of cursor
 * arithmetic.
 *
 * Like `page-ready.ts`, nothing here knows about CopilotKit or this app: it is
 * plain Playwright plus the cursor overlay. It belongs beside `core/actions.ts`
 * and should be promoted to `core/` (and ported to the other framework repos)
 * when `core/` is next unfrozen.
 */

import { type Locator, type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import {
  DEFAULT_ASSISTANT_MESSAGE_SELECTOR,
  promptsFor,
  sendPrompt,
  waitForAgentResponseCompletion,
  type SendPromptOptions,
} from '../core/actions';
import { type PageRecordConfig } from '../core/types';
import { waitForDomSettled } from './page-ready';

/** Glides to the centre of `target` and clicks it. Throws if it never appears. */
export async function humanClickLocator(
  page: Page,
  target: Locator,
  opts: { timeoutMs?: number; steps?: number } = {},
): Promise<void> {
  const { timeoutMs = 10000, steps = 20 } = opts;
  await target.waitFor({ state: 'visible', timeout: timeoutMs });
  await target.scrollIntoViewIfNeeded().catch(() => {});
  const box = await target.boundingBox();
  if (box) {
    await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, steps);
    await humanClick(page);
  } else {
    await target.click();
  }
}

/**
 * Clicks the first visible control whose accessible name or text matches, as a
 * tab, button or link. `exact` avoids "Chat" also matching "CopilotChat".
 */
export function control(page: Page, name: string | RegExp, exact = false): Locator {
  const byRole = (role: 'tab' | 'button' | 'link') =>
    page.getByRole(role, typeof name === 'string' ? { name, exact } : { name });
  return byRole('tab').or(byRole('button')).or(byRole('link')).first();
}

/**
 * Switches to a tab/variant by its label and waits for whatever it mounted to
 * stop moving. A tab that remounts a chat has the same cold-chunk problem as
 * first load, which is why the settle is not optional.
 */
export async function switchTo(
  page: Page,
  name: string | RegExp,
  opts: { exact?: boolean; settleMs?: number; label?: string } = {},
): Promise<void> {
  const { exact = false, settleMs = 800, label } = opts;
  if (label) console.log(`   ${label} → ${String(name)}`);
  await humanClickLocator(page, control(page, name, exact));
  await sleep(400);
  await waitForDomSettled(page, { settleMs, timeoutMs: 15000 });
}

/**
 * Moves the cursor onto a native `<select>` and picks a value. The popup list
 * is browser chrome and never shows in a viewport recording, so the visible
 * evidence is the control's new value and whatever re-renders from it.
 */
export async function humanSelect(page: Page, selector: string, value: string): Promise<void> {
  const select = page.locator(selector).first();
  await select.waitFor({ state: 'visible', timeout: 10000 });
  const box = await select.boundingBox();
  if (box) {
    await humanGlide(page, box.x + Math.min(box.width / 2, 160), box.y + box.height / 2, 18);
    await humanClick(page);
  }
  await select.selectOption(value);
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(500);
}

/** Rests the cursor on an element for `holdMs` if it is on screen; never throws. */
export async function focusOn(page: Page, target: Locator, holdMs = 1500): Promise<boolean> {
  if (!(await target.isVisible({ timeout: 2000 }).catch(() => false))) return false;
  await target.scrollIntoViewIfNeeded().catch(() => {});
  const box = await target.boundingBox();
  if (!box) return false;
  await humanGlide(
    page,
    box.x + Math.min(box.width / 2, 240),
    box.y + Math.min(box.height / 2, 80),
    20,
  );
  await sleep(holdMs);
  return true;
}

/**
 * Waits for the feature-specific evidence a page exists to produce — a
 * rendered card, chart, iframe, approval prompt — and fails the run with
 * `why` if it never appears.
 *
 * This is the difference between "an assistant message arrived" and "the
 * feature worked". A generative-UI page whose renderer silently fell back to
 * plain text still produces an assistant message; without this check it would
 * report [PASS].
 */
export async function expectVisible(
  target: Locator,
  why: string,
  timeoutMs = 30000,
): Promise<void> {
  const ok = await target
    .first()
    .waitFor({ state: 'visible', timeout: timeoutMs })
    .then(() => true)
    .catch(() => false);
  if (!ok) throw new Error(why);
}

/** Like `expectVisible`, but only logs — for evidence that is nice-to-see, not proof. */
export async function noteIfVisible(target: Locator, what: string, timeoutMs = 8000): Promise<boolean> {
  const ok = await target
    .first()
    .waitFor({ state: 'visible', timeout: timeoutMs })
    .then(() => true)
    .catch(() => false);
  console.log(ok ? `   ✓ ${what}` : `   ⚠️ ${what}: not seen`);
  return ok;
}

export interface TurnOptions extends SendPromptOptions {
  /** Reading pause after each reply. Defaults to the page's waitAfterPromptMs. */
  waitMs?: number;
}

/** One prompt → one completed reply. Returns nothing; throws if no reply arrives. */
export async function chatTurn(
  page: Page,
  config: PageRecordConfig,
  prompt: string,
  opts: TurnOptions = {},
): Promise<void> {
  const { waitMs = config.waitAfterPromptMs ?? 4000, ...send } = opts;
  const messageSelector = send.messageSelector ?? DEFAULT_ASSISTANT_MESSAGE_SELECTOR;
  const before = await sendPrompt(page, prompt, { timeoutMs: 15000, ...send });
  await waitForAgentResponseCompletion(page, waitMs, before, messageSelector);
}

/** Every prompt the page declares, in order, in the chat currently on screen. */
export async function chatTurns(
  page: Page,
  config: PageRecordConfig,
  opts: TurnOptions = {},
): Promise<void> {
  for (const prompt of promptsFor(config)) await chatTurn(page, config, prompt, opts);
}

/**
 * Clicks a suggestion chip by its title when the page shows one, else types
 * the prompt. Suggestions are part of what several pages teach
 * (`useConfigureSuggestions`), so clicking them is the more honest demo.
 */
export async function suggestionOrPrompt(
  page: Page,
  config: PageRecordConfig,
  title: string,
  prompt: string,
  opts: TurnOptions = {},
): Promise<void> {
  const chip = page.getByRole('button', { name: title }).first();
  if (await chip.isVisible({ timeout: 2500 }).catch(() => false)) {
    const messageSelector = opts.messageSelector ?? DEFAULT_ASSISTANT_MESSAGE_SELECTOR;
    const before = await page
      .evaluate((sel) => document.querySelectorAll(sel).length, messageSelector)
      .catch(() => 0);
    console.log(`   💡 Clicking suggestion "${title}"`);
    await humanClickLocator(page, chip);
    await waitForAgentResponseCompletion(
      page,
      opts.waitMs ?? config.waitAfterPromptMs ?? 4000,
      before,
      messageSelector,
    );
    return;
  }
  await chatTurn(page, config, prompt, opts);
}

/**
 * Fails fast, with the command to fix it, when a page's external dependency
 * (an MCP reference server) is not running. Any HTTP answer counts as up —
 * MCP endpoints reject a bare GET — only a refused/timed-out connection fails.
 */
export async function assertReachable(url: string, startHint: string): Promise<void> {
  try {
    await fetch(url, { method: 'GET', signal: AbortSignal.timeout(4000) });
  } catch (e) {
    throw new Error(
      `${url} is not reachable (${e instanceof Error ? e.message : String(e)}). ` +
        `Start it first: ${startHint}`,
    );
  }
}
