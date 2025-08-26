import os
from fastapi import FastAPI
import uvicorn
from copilotkit import LangGraphAGUIAgent 
from ag_ui_langgraph import add_langgraph_fastapi_endpoint 
from src.agent import orchestrator_agent

from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

add_langgraph_fastapi_endpoint(
  app=app,
  agent=LangGraphAGUIAgent(
    name="orchestrator_agent",
    description="Orchestrator agent for managing data visualization workflows and coordinating with specialized agents.",
    graph=orchestrator_agent,
  ),
  path="/copilotkit",
)

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