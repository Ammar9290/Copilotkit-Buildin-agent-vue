/**
 * Line ranges that follow the code instead of going stale.
 *
 * `startLine`/`endLine` used to be typed in by hand, and they drifted every
 * time a demo file was touched: the 2026-10-30 sync and one dependency bump
 * left the shared `package.json` tab highlighting the `mcp:*` scripts, and the
 * Model Selection range pointing 29 lines past the end of a file that had
 * shrunk. Nothing errors when a range is wrong — the video just shows the
 * wrong code.
 *
 * `span()` resolves a range from text in the file when the config loads:
 *
 *   span('frontend/package.json', '"dependencies": {')          // to the block's closing brace
 *   span(file, 'useHumanInTheLoop({', '});')                     // to the next line containing '});'
 *   span(file, /^export default function/, 12)                   // 12 lines from the anchor
 *
 * The result is still plain numbers, so `npm run doctor` checks it exactly as
 * before. An anchor that no longer exists resolves to an invalid 0–0 range,
 * which the doctor reports as an error naming the file — the failure is loud
 * and lands on the right page instead of silently highlighting the wrong lines.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type IdeTabConfig } from '../core/types';

/** Repo root: this file lives at `<root>/autorecorder/config/anchors.ts`. */
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const cache = new Map<string, string[]>();

function linesOf(filePath: string): string[] | null {
  if (cache.has(filePath)) return cache.get(filePath)!;
  const full = join(REPO_ROOT, filePath);
  if (!existsSync(full)) return null;
  const lines = readFileSync(full, 'utf-8').replace(/\r\n/g, '\n').split('\n');
  cache.set(filePath, lines);
  return lines;
}

type Matcher = string | RegExp;

function matches(line: string, m: Matcher): boolean {
  return typeof m === 'string' ? line.includes(m) : m.test(line);
}

/** Index of the line that closes the bracket opened on `start` (by depth). */
function closingLine(lines: string[], start: number): number {
  let depth = 0;
  let opened = false;
  for (let i = start; i < lines.length; i++) {
    // Strings and comments are rare enough on anchor lines that a plain count
    // is right in practice; the doctor still validates the result.
    for (const ch of lines[i]) {
      if (ch === '{' || ch === '(' || ch === '[') {
        depth++;
        opened = true;
      } else if (ch === '}' || ch === ')' || ch === ']') {
        depth--;
      }
    }
    if (opened && depth <= 0) return i;
  }
  return -1;
}

export interface SpanOptions {
  /** Use the Nth match of `from` (1-based). Default 1. */
  nth?: number;
  /** Start the range this many lines above the anchor, e.g. to include a comment. */
  before?: number;
  /** Search for `from` only after the first line matching this. */
  after?: Matcher;
}

const misses: string[] = [];

/** Anchors that did not resolve, for the CLI / doctor to print. */
export function unresolvedAnchors(): readonly string[] {
  return misses;
}

/**
 * Resolves an IDE tab from text anchors.
 *
 * @param from  The first highlighted line contains this (or matches this regex).
 * @param to    Omitted: through the bracket that `from`'s line opens.
 *              A string/regex: through the next line that matches it.
 *              A number: that many lines, counting the anchor line.
 */
export function span(
  filePath: string,
  from: Matcher,
  to?: Matcher | number,
  opts: SpanOptions = {},
): IdeTabConfig {
  const { nth = 1, before = 0, after } = opts;
  const lines = linesOf(filePath);
  const miss = (why: string): IdeTabConfig => {
    misses.push(`${filePath}: ${why}`);
    return { filePath, startLine: 0, endLine: 0 };
  };
  if (!lines) return miss('file not found');

  let from0 = 0;
  if (after !== undefined) {
    const a = lines.findIndex((l) => matches(l, after));
    if (a < 0) return miss(`"after" anchor ${String(after)} not found`);
    from0 = a + 1;
  }

  let start = -1;
  let seen = 0;
  for (let i = from0; i < lines.length; i++) {
    if (matches(lines[i], from) && ++seen === nth) {
      start = i;
      break;
    }
  }
  if (start < 0) return miss(`anchor ${String(from)} not found`);

  let end: number;
  if (to === undefined) {
    end = closingLine(lines, start);
  } else if (typeof to === 'number') {
    end = Math.min(lines.length - 1, start + to - 1);
  } else {
    end = -1;
    for (let i = start + 1; i < lines.length; i++) {
      if (matches(lines[i], to)) {
        end = i;
        break;
      }
    }
  }
  if (end < start) return miss(`no end found for ${String(from)}`);

  return {
    filePath,
    startLine: Math.max(1, start + 1 - before),
    endLine: end + 1,
  };
}

/** Whole file, for short files whose every line is the lesson. */
export function whole(filePath: string, opts: { skipDirective?: boolean } = {}): IdeTabConfig {
  const lines = linesOf(filePath);
  if (!lines) {
    misses.push(`${filePath}: file not found`);
    return { filePath, startLine: 0, endLine: 0 };
  }
  let last = lines.length;
  while (last > 1 && lines[last - 1].trim() === '') last--;
  const first = opts.skipDirective && /^["']use client["']/.test(lines[0]) ? 2 : 1;
  return { filePath, startLine: first, endLine: last };
}
