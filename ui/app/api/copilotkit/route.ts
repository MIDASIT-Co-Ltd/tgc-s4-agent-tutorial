// Ref. https://github.com/CopilotKit/coagents-starter-langgraph

import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

// You can use any service adapter here for multi-agent support.
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  remoteEndpoints: [
    {
      url: process.env.REMOTE_ACTION_URL || "http://localhost:8007/copilotkit",
    },
  ],
});

export const POST = async (req: NextRequest) => {
  console.log("🚀 Next.js API Route called");
  console.log("🚀 Request URL:", req.url);
  
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  try {
    const response = await handleRequest(req);
    console.log("✅ Next.js API Response status:", response.status);
    return response;
  } catch (error) {
    console.error("❌ Next.js API Error:", error);
    throw error;
  }
};