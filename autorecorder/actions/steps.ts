/**
 * Declarative page scripts.
 *
 * Most demo pages added in the 2026-10-30 sync have the same shape: a row of
 * variant buttons, a chat per variant, and a feature-specific surface that must
 * appear after the reply (an A2UI surface, a chart, an iframe, an approval
 * card). Writing a bespoke handler for each would mean twenty copies of the
 * same loop, each drifting in its own way, so those pages are described as a
 * list of steps instead and `stepsHandler()` turns the list into a handler.
 *
 *   stepsHandler('Catalogs', [
 *     { variant: 'shopUI (Create a catalog)', prompt: 0,
 *       expect: { selector: '.a2ui-surface', why: 'no A2UI surface rendered' } },
 *     { variant: 'exportA2UICatalog', noChat: true, focus: 'pre' },
 *   ])
 *
 * `prompt` is an index into the page's `prompts[]` in `pages.config.ts`, so the
 * prompt text lives in one place and the manifest's page hash still covers it.
 *
 * A step's `expect` is a hard check — the run fails if it is never seen —
 * because "an assistant message arrived" is not the same claim as "the feature
 * worked": a generative-UI renderer that silently fell back to markdown still
 * produces a message. `note` is the soft version, for evidence that depends on
 * the model's choices or on optional configuration.
 */

import { type Locator, type Page } from 'playwright';
import { sleep } from '../core/overlays/cursor';
import { DEFAULT_ASSISTANT_MESSAGE_SELECTOR, promptsFor, sendPrompt } from '../core/actions';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import {
  chatTurn,
  expectVisible,
  focusOn,
  humanClickLocator,
  noteIfVisible,
  switchTo,
} from './drive';

/**
 * CopilotKit Vue's own chat textarea (`@copilotkit/vue` 1.87.0). Preferred over the generic
 * `SELECTORS.chatInput` because several demos (state-and-actions, headless
 * threads, theming) put other inputs on the page before the chat, and a CSS
 * union's `.first()` is the first in *document* order, not selector order.
 */
export const COPILOT_TEXTAREA = '[data-testid="copilot-chat-input-textarea"]';

export interface Check {
  selector: string;
  /** For `expect`: the failure message. For `note`: what was being looked for. */
  why: string;
  timeoutMs?: number;
}

export interface Step {
  /** Log label. Defaults to the variant name. */
  label?: string;
  /** Click this variant/tab button first (matched by accessible name, exactly). */
  variant?: string;
  /** Match the variant by substring instead of exactly. */
  variantLoose?: boolean;
  /** Buttons/links to click before prompting, by accessible name (exact). */
  clicks?: string[];
  /** CSS/Playwright selectors to click before prompting. */
  clickSelectors?: string[];
  /** Index into the page's prompts[], or literal text. Omit for no chat turn. */
  prompt?: number | string;
  /** The variant renders no chat (export views etc.) — never look for an input. */
  noChat?: boolean;
  /** Chat input override; defaults to the CopilotKit textarea when present. */
  inputSelector?: string;
  /** Assistant-reply selector override (custom message views). */
  messageSelector?: string;
  /** Reading pause after the reply. */
  waitMs?: number;
  /**
   * `false` for turns that legitimately end without a text reply — a
   * maxSteps-1 tool call, an MCP App iframe, an Open Generative UI sandbox, a
   * state write. The prompt is sent and the step's `expect` is the proof;
   * the core reply detector (which throws after 30s without text) is skipped.
   */
  awaitReply?: boolean;
  /** Wait for this to disappear after the checks (spinners, "running" badges). */
  gone?: Check;
  /** Hard proof after the reply. The run fails if any is never visible. */
  expect?: Check | Check[];
  /** Soft evidence after the reply: logged, never fails. */
  note?: Check | Check[];
  /** Rest the cursor on this after the checks. */
  focus?: string;
  /** Selectors/names to click after the reply (approve buttons, row actions). */
  thenClicks?: (string | { selector: string })[];
  /** Escape hatch for anything else, run last. */
  run?: (page: Page, config: PageRecordConfig) => Promise<void>;
}

const list = <T>(x: T | T[] | undefined): T[] => (x === undefined ? [] : Array.isArray(x) ? x : [x]);

async function inputFor(page: Page, step: Step): Promise<string | undefined> {
  if (step.inputSelector) return step.inputSelector;
  const hasCopilot = await page
    .locator(COPILOT_TEXTAREA)
    .first()
    .waitFor({ state: 'visible', timeout: 6000 })
    .then(() => true)
    .catch(() => false);
  return hasCopilot ? COPILOT_TEXTAREA : undefined;
}

function named(page: Page, name: string): Locator {
  return page
    .getByRole('button', { name, exact: true })
    .or(page.getByRole('link', { name, exact: true }))
    .or(page.getByRole('tab', { name, exact: true }))
    .first();
}

async function clickAll(page: Page, items: (string | { selector: string })[]): Promise<void> {
  for (const item of items) {
    const target =
      typeof item === 'string' ? named(page, item) : page.locator(item.selector).first();
    console.log(`   🖱️  ${typeof item === 'string' ? item : item.selector}`);
    await humanClickLocator(page, target, { timeoutMs: 15000 });
    await sleep(700);
  }
}

export async function runSteps(
  page: Page,
  config: PageRecordConfig,
  title: string,
  steps: Step[],
): Promise<void> {
  const prompts = promptsFor(config);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const label = step.label ?? step.variant ?? `step ${i + 1}`;
    console.log(`   [${title}] ${i + 1}/${steps.length}: ${label}`);

    if (step.variant) {
      await switchTo(page, step.variant, { exact: !step.variantLoose });
    }

    if (step.clicks?.length) await clickAll(page, step.clicks);
    if (step.clickSelectors?.length) {
      await clickAll(page, step.clickSelectors.map((selector) => ({ selector })));
    }

    if (step.prompt !== undefined && !step.noChat) {
      const text = typeof step.prompt === 'number' ? prompts[step.prompt] : step.prompt;
      if (!text) throw new Error(`${title}: step ${i + 1} refers to prompts[${String(step.prompt)}], which pages.config does not define`);
      const inputSelector = await inputFor(page, step);
      if (step.awaitReply === false) {
        await sendPrompt(page, text, { inputSelector, timeoutMs: 15000 });
      } else {
        await chatTurn(page, config, text, {
          inputSelector,
          messageSelector: step.messageSelector ?? DEFAULT_ASSISTANT_MESSAGE_SELECTOR,
          waitMs: step.waitMs ?? config.waitAfterPromptMs ?? 3000,
          timeoutMs: 15000,
        });
      }
    }

    for (const check of list(step.expect)) {
      await expectVisible(page.locator(check.selector), `${label}: ${check.why}`, check.timeoutMs ?? 30000);
      console.log(`   ✓ ${label}: ${check.selector}`);
    }
    for (const check of list(step.note)) {
      await noteIfVisible(page.locator(check.selector), `${label}: ${check.why}`, check.timeoutMs ?? 8000);
    }

    if (step.gone) {
      const ok = await page
        .locator(step.gone.selector)
        .first()
        .waitFor({ state: 'detached', timeout: step.gone.timeoutMs ?? 60000 })
        .then(() => true)
        .catch(() => false);
      if (!ok) throw new Error(`${label}: ${step.gone.why}`);
    }
    if (step.awaitReply === false && step.prompt !== undefined) {
      await sleep(step.waitMs ?? config.waitAfterPromptMs ?? 3000);
    }

    if (step.focus) await focusOn(page, page.locator(step.focus).last(), 2000);
    if (step.thenClicks?.length) await clickAll(page, step.thenClicks);
    if (step.run) await step.run(page, config);
  }
}

/** Builds a page handler from a step list. */
export function stepsHandler(title: string, steps: Step[]): PageActionHandler {
  return (page, config) => runSteps(page, config, title, steps);
}
