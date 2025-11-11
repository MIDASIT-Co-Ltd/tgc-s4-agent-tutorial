import os
from fastapi import FastAPI
from ag_ui_adk import add_adk_fastapi_endpoint
from agent.agent import root_agent
from extended_copilotkit_adk_agent import ExtendedCopilotKitADKAgent


if os.environ.get("USE_LANGFUSE", "true").lower() == "true":
    from langfuse import get_client
    langfuse = get_client()
    
    # Verify connection
    if langfuse.auth_check():
        print("Langfuse client is authenticated and ready!")
    else:
        print("Authentication failed. Please check your credentials and host.")


    from openinference.instrumentation.google_adk import GoogleADKInstrumentor
    
    GoogleADKInstrumentor().instrument()


ag_ui_adk_agent = ExtendedCopilotKitADKAgent(
    adk_agent=root_agent,
    app_name="agents",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
    extend_frontend_actions_to_subagents=True
)

# Create FastAPI app
app = FastAPI(title="ADK Middleware Sample Agent")
# Add the ADK endpoint
add_adk_fastapi_endpoint(app, ag_ui_adk_agent, path="/")
# If you want the server to run on invocation, you can do the following:
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)