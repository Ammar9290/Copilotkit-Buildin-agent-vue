/** Runtime endpoint from the Vue quickstart (Node runtime on :8200). */
export const RUNTIME_URL =
  import.meta.env.VITE_RUNTIME_URL || "http://localhost:8200/api/copilotkit";

/** Only needed for Threads (CopilotKit Intelligence). Empty = locked drawer. */
export const PUBLIC_LICENSE_KEY =
  import.meta.env.VITE_COPILOTKIT_PUBLIC_LICENSE_KEY || undefined;

export const DOCS_ROOT = "https://docs.copilotkit.ai";
