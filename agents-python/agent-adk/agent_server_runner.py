from fastapi import FastAPI
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from agent.agent import root_agent


ag_ui_adk_agent = ADKAgent(
    adk_agent=root_agent,
    app_name="demo_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True
)

# Create FastAPI app
app = FastAPI(title="ADK Middleware Sample Agent")
# Add the ADK endpoint
add_adk_fastapi_endpoint(app, ag_ui_adk_agent, path="/")
# If you want the server to run on invocation, you can do the following:
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)