import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import "@copilotkit/react-ui/styles.css";
import OpenAI from "openai";

const agentService = process.env.AGENT_SERVICE?.toLowerCase();

let serviceAdapter;
let runtime;

if (agentService === "langgraph") {
  serviceAdapter = new ExperimentalEmptyAdapter();
  runtime = new CopilotRuntime({
    remoteEndpoints: [
      {
        url: process.env.AGENT_SERVICE_URL || "http://localhost:8007/copilotkit",
      },
    ],
  });
} else {
  // Default to OpenAI (for "openai" value or if AGENT_SERVICE is not set/unrecognized)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  serviceAdapter = new OpenAIAdapter({
    openai,
    model: "gpt-5-nano",
  });
  runtime = new CopilotRuntime();
}

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
