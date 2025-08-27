# Ref. https://github.com/CopilotKit/coagents-starter-langgraph

import os
import uvicorn
import logging
from fastapi import FastAPI, Request
from copilotkit import CopilotKitRemoteEndpoint, LangGraphAgent
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from src.agent import orchestrator_agent

from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

sdk = CopilotKitRemoteEndpoint(
    agents=[
        LangGraphAgent(
            name="agent",
            description="Orchestrator agent for managing data visualization workflows and coordinating with specialized agents.",
            graph=orchestrator_agent,
        )
    ]
)

add_fastapi_endpoint(app, sdk, "/copilotkit")

@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


def main():
    """Run the uvicorn server."""
    port = int(os.getenv("LANGGRAPH_ENDPOINT_PORT", "8007"))
    uvicorn.run(
        "src.endpoint:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )

if __name__ == "__main__":
    main()