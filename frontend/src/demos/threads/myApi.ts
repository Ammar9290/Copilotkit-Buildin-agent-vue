import type { Message } from "@ag-ui/client";
import { RUNTIME_URL } from "@/config";

/**
 * Stand-in for "your own API" in the Thread Lifecycle doc samples. History is
 * read from the runtime's thread routes (backed by InMemoryAgentRunner).
 */
export const myApi = {
  async getMessages(threadId: string): Promise<Message[]> {
    const res = await fetch(`${RUNTIME_URL}/threads/${encodeURIComponent(threadId)}/messages`);
    if (!res.ok) throw new Error(`GET /threads/${threadId}/messages → ${res.status}`);
    const body = (await res.json()) as { messages?: Message[] };
    return body.messages ?? [];
  },
  async createThread(): Promise<{ id: string }> {
    return { id: `app-${crypto.randomUUID().slice(0, 8)}` };
  },
};
