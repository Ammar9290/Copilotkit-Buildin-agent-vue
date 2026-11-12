import { z } from "zod";
import { generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { EventType, type BaseEvent } from "@ag-ui/client";
import {
  BuiltInAgent,
  convertMessagesToVercelAISDKMessages,
  convertToolsToVercelAITools,
  defineTool,
  resolveModel,
} from "@copilotkit/runtime/v2";

/** Model string from the Vue quickstart; override with COPILOT_MODEL. */
const MODEL = process.env.COPILOT_MODEL ?? "openai:gpt-6-luna";

// ---------------------------------------------------------------------------
// Server-side mock tools (Tool Rendering page). Modelled on the concierge
// backend used by the Tool Call Rendering doc, ported to `defineTool`.
// ---------------------------------------------------------------------------

const getWeather = defineTool({
  name: "get_weather",
  description: "Get the current weather for a given city.",
  parameters: z.object({ city: z.string().describe("City name") }),
  execute: async ({ city }) => ({
    city,
    temperature: 68,
    humidity: 55,
    wind_speed: 10,
    conditions: "Sunny",
  }),
});

const searchFlights = defineTool({
  name: "search_flights",
  description: "Search mock flights. Origin defaults to SFO.",
  parameters: z.object({
    origin: z.string().default("SFO"),
    destination: z.string(),
  }),
  execute: async ({ origin, destination }) => ({
    origin,
    destination,
    flights: [
      { airline: "Vue Air", departs: "08:10", price: 289 },
      { airline: "Composable Jet", departs: "13:45", price: 241 },
    ],
  }),
});

const getStockPrice = defineTool({
  name: "get_stock_price",
  description: "Get a mock stock price for a ticker symbol.",
  parameters: z.object({ ticker: z.string() }),
  execute: async ({ ticker }) => ({
    ticker: ticker.toUpperCase(),
    price: 123.45,
    change_pct: 1.8,
  }),
});

const rollD20 = defineTool({
  name: "roll_d20",
  description: "Roll a twenty-sided die. Pass `value` for a deterministic roll.",
  parameters: z.object({ value: z.number().int().min(1).max(20).optional() }),
  execute: async ({ value }) => ({
    value: value ?? Math.floor(Math.random() * 20) + 1,
  }),
});

// ---------------------------------------------------------------------------
// Governed Action Approval page, pattern 1 (`useInterrupt`). The built-in
// agent supports interrupting tools via `defineTool({ interrupt: true })`.
// ---------------------------------------------------------------------------

const executeGovernedAction = defineTool({
  name: "execute_governed_action",
  description:
    "Perform a side-effect action (send email, apply discount, update record). " +
    "The run pauses for policy / user approval before anything happens.",
  parameters: z.object({
    id: z.string(),
    summary: z.string(),
    tool: z.string(),
    reference: z.string(),
    verdict: z.enum(["allow", "deny", "require_approval"]),
    arguments: z.record(z.string(), z.unknown()),
  }),
  interrupt: true,
  interruptReason: "governed_action",
  interruptMessage: "This action requires approval before it runs.",
});

// ---------------------------------------------------------------------------
// Sub-agents page. The Vue doc only ships a Python/LangGraph backend sample,
// so the supervisor/sub-agent pattern is re-expressed with BuiltInAgent:
// each sub-agent is its own model call wrapped in a server tool.
// ---------------------------------------------------------------------------

async function runSubAgent(system: string, task: string): Promise<string> {
  const { text } = await generateText({
    model: resolveModel(MODEL),
    system,
    prompt: task,
  });
  return text.trim() || "<sub-agent produced no output>";
}

const researchAgent = defineTool({
  name: "research_agent",
  description: "Delegate a research task. Returns 3-5 bulleted key facts.",
  parameters: z.object({ task: z.string() }),
  execute: async ({ task }) =>
    runSubAgent(
      "You are a research sub-agent. Produce a concise bulleted list of 3-5 key facts. No preamble.",
      task,
    ),
});

const writingAgent = defineTool({
  name: "writing_agent",
  description: "Delegate a drafting task. Pass relevant facts inside `task`.",
  parameters: z.object({ task: z.string() }),
  execute: async ({ task }) =>
    runSubAgent(
      "You are a writing sub-agent. Produce a polished one-paragraph draft. No preamble.",
      task,
    ),
});

const critiqueAgent = defineTool({
  name: "critique_agent",
  description: "Delegate a critique of a draft. Call at most once per request.",
  parameters: z.object({ task: z.string() }),
  execute: async ({ task }) =>
    runSubAgent(
      "You are an editorial critique sub-agent. Give 2-3 crisp, actionable critiques. No preamble.",
      task,
    ),
});

// ---------------------------------------------------------------------------
// Agent registry
// ---------------------------------------------------------------------------

export function buildAgents() {
  return {
    /** Quickstart default agent, plus the tool-rendering + governed tools. */
    default: new BuiltInAgent({
      model: MODEL,
      prompt:
        "You are a helpful assistant for a Vue app. " +
        "You can call mock tools for weather, flights, stock prices and d20 rolls when asked. " +
        "When the user asks you to perform a side-effect action (email, discount, record update), " +
        "call execute_governed_action with a fresh id, a short summary, the target tool name, " +
        "a policy reference like POL-123, and verdict 'require_approval' unless told otherwise.",
      tools: [getWeather, searchFlights, getStockPrice, rollD20, executeGovernedAction],
      maxSteps: 5,
    }),

    /** Agent id used by most Vue doc samples (`agent-id="my-agent"`). */
    "my-agent": new BuiltInAgent({
      model: MODEL,
      prompt:
        "You are a helpful support assistant inside a Vue test harness. " +
        "Keep answers short. You can call get_weather when asked about weather.",
      tools: [getWeather],
      maxSteps: 5,
    }),

    /** Programmatic Control page (`agentId: "sales"`). */
    sales: new BuiltInAgent({
      model: MODEL,
      prompt:
        "You are a sales analyst. When asked to summarize sales, call get_sales_data " +
        "and summarize the result in two sentences.",
      tools: [
        defineTool({
          name: "get_sales_data",
          description: "Return the latest mock sales data.",
          parameters: z.object({}),
          execute: async () => ({
            quarter: "Q3",
            revenue: 1_240_000,
            growth_pct: 12.4,
            top_region: "EMEA",
          }),
        }),
      ],
      maxSteps: 5,
    }),

    /** Shared State pages (`agentId: "workspace"`). */
    workspace: new BuiltInAgent({
      model: MODEL,
      prompt:
        "You collaborate on a shared workspace. The application state contains `notes` " +
        "(string[]), `preferences.tone`, and optionally `title` and `items` " +
        "({id,label,done}[]). When the user asks to add notes, change the title, add or " +
        "toggle items, update the state with AGUISendStateSnapshot (send the full state). " +
        "Respect preferences.tone when it is set.",
      maxSteps: 5,
    }),

    /** Threads pages (`agent-id="support"`). */
    support: new BuiltInAgent({
      model: MODEL,
      prompt: "You are a customer support desk assistant. Keep replies brief.",
    }),

    /** MCP Apps page. MCP servers are attached at runtime level (server.ts). */
    "mcp-apps": new BuiltInAgent({
      model: MODEL,
      prompt:
        "You are an assistant with MCP App tools. Use them when the user asks for something they provide.",
      maxSteps: 5,
    }),

    /** Sub-Agents page: supervisor delegating to three sub-agent tools. */
    subagents: new BuiltInAgent({
      model: MODEL,
      prompt:
        "You are a supervisor. For writing requests: call research_agent first, then " +
        "writing_agent with the facts, then critique_agent once. Then give the final answer.",
      tools: [researchAgent, writingAgent, critiqueAgent],
      maxSteps: 8,
    }),

    /** Use any model router — AI SDK factory mode (doc Quick Start + With Tools). */
    "router-aisdk": new BuiltInAgent({
      type: "aisdk",
      factory: ({ input, abortSignal }) => {
        const tools = convertToolsToVercelAITools(input.tools);
        return streamText({
          model: openai("gpt-6-luna"),
          messages: convertMessagesToVercelAISDKMessages(input.messages),
          tools,
          abortSignal,
        });
      },
    }),

    /**
     * Use any model router — custom factory mode. This is the doc's scripted
     * tool-call example; it emits AG-UI events directly and needs no model
     * key, which makes it the offline smoke-test agent for the suite.
     */
    "router-custom": new BuiltInAgent({
      type: "custom",
      factory: async function* ({ input }) {
        void input;
        const messageId = crypto.randomUUID();
        const toolCallId = crypto.randomUUID();

        yield {
          type: EventType.TOOL_CALL_START,
          parentMessageId: messageId,
          toolCallId,
          toolCallName: "getWeather",
        } as BaseEvent;

        yield {
          type: EventType.TOOL_CALL_ARGS,
          toolCallId,
          delta: JSON.stringify({ city: "San Francisco" }),
        } as BaseEvent;

        yield { type: EventType.TOOL_CALL_END, toolCallId } as BaseEvent;

        yield {
          type: EventType.TOOL_CALL_RESULT,
          role: "tool",
          messageId: crypto.randomUUID(),
          toolCallId,
          content: JSON.stringify({ temp: 72, city: "San Francisco" }),
        } as BaseEvent;

        yield {
          type: EventType.TEXT_MESSAGE_CHUNK,
          role: "assistant",
          messageId,
          delta: "The weather in San Francisco is 72°F.",
        } as BaseEvent;
      },
    }),
  };
}

