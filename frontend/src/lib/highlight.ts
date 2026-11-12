/**
 * Shiki, loaded once and only for the grammars this app shows.
 *
 * Fine-grained imports keep the bundle to the three grammars and one theme
 * actually used, instead of Shiki's full language set.
 */
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

let highlighter: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [import("shiki/themes/github-dark-default.mjs")],
    langs: [
      import("shiki/langs/vue.mjs"),
      import("shiki/langs/typescript.mjs"),
      import("shiki/langs/json.mjs"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

const LANG: Record<string, string> = { vue: "vue", ts: "typescript", json: "json" };

/** Returns highlighted HTML, or null when the language has no grammar here. */
export async function highlight(code: string, language: string): Promise<string | null> {
  const lang = LANG[language];
  if (!lang) return null;
  try {
    const h = await getHighlighter();
    return h.codeToHtml(code, { lang, theme: "github-dark-default" });
  } catch {
    return null;
  }
}
