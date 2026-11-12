/**
 * Read this repository's own files, verbatim, for display on the notes pages.
 *
 * Vite inlines each matched file as a raw string at build time (lazily, one
 * chunk per file), so what a page shows is always the code currently in the
 * repo — compare it directly against the doc page linked in the route header.
 *
 * Paths are repo-relative ("frontend/src/…", "backend/…") so the same strings
 * can be used here, in the README, and in the autorecorder's page registry.
 */

const frontendFiles = import.meta.glob(
  ["/src/**/*.{vue,ts}", "/package.json", "/vite.config.ts"],
  { query: "?raw", import: "default" },
) as Record<string, () => Promise<string>>;

const backendFiles = import.meta.glob(
  ["../backend/*.ts", "../backend/agents/*.ts", "../backend/package.json"],
  { query: "?raw", import: "default" },
) as Record<string, () => Promise<string>>;

const LOADERS = new Map<string, () => Promise<string>>();
for (const [key, load] of Object.entries(frontendFiles)) {
  LOADERS.set(`frontend${key}`, load);
}
for (const [key, load] of Object.entries(backendFiles)) {
  LOADERS.set(key.replace(/^\.\.\//, ""), load);
}

export interface SourceFile {
  path: string;
  code: string;
  language: string;
  error?: string;
}

export function languageFor(path: string): string {
  const ext = path.split(".").pop() ?? "";
  if (ext === "vue") return "vue";
  if (ext === "ts") return "ts";
  if (ext === "json") return "json";
  return "text";
}

export async function readSource(path: string): Promise<SourceFile> {
  const load = LOADERS.get(path);
  if (!load) {
    return {
      path,
      code: "",
      language: "text",
      error: `File not found in the source index: ${path}`,
    };
  }
  return { path, code: (await load()).replace(/\r\n/g, "\n"), language: languageFor(path) };
}
