from pathlib import Path
from google.adk.models.lite_llm import LiteLlm
from google.adk.agents.llm_agent import Agent
from google.adk.tools import FunctionTool
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams, SseConnectionParams
from mcp import StdioServerParameters

model_name = "openai/gpt-5-mini"
llm = LiteLlm(model=model_name, timeout=180, stream_options={"include_usage": True})


def get_weather_report(city: str) -> dict:
    """Retrieves the current weather report for a specified city.

    Returns:
        dict: A dictionary containing the weather information with a 'status' key ('success' or 'error') and a 'report' key with the weather details if successful, or an 'error_message' if an error occurred.
    """
    if city.lower() == "london":
        return {"status": "success", "report": "The current weather in London is cloudy with a temperature of 18 degrees Celsius and a chance of rain."}
    elif city.lower() == "paris":
        return {"status": "success", "report": "The weather in Paris is sunny with a temperature of 25 degrees Celsius."}
    else:
        return {"status": "error", "error_message": f"Weather information for '{city}' is not available."}

weather_tool = FunctionTool(func=get_weather_report)

def create_filesystem_toolset():
    workspace_dir = str((Path(__file__).parent / "workspace").absolute())
    toolset = MCPToolset(
        connection_params=StdioConnectionParams(
            server_params=StdioServerParameters(
            command='npx',
            args=["-y", "@modelcontextprotocol/server-filesystem", workspace_dir]
        )),
        tool_filter=[]  # Optional: filter specific tools
    )
    return toolset

def create_mcp_sse_server_toolset(url: str):
    toolset = MCPToolset(
        connection_params=SseConnectionParams(
            url=url 
        ),
        tool_filter=[]  # Optional: filter specific tools
    )
    return toolset

def create_python_code_executor_toolset():
    toolset = MCPToolset(
        connection_params=StdioConnectionParams(
            server_params=StdioServerParameters(
            command='uv',
            args=["run", "--directory", str((Path(__file__).parent.parent.parent / "code-executor").absolute()), "code_executor.py"]
        )),
        tool_filter=[]  # Optional: filter specific tools
    )
    return toolset
                # Replace with actual server URL

def create_orchestrator_agent(sub_agents, tools):
    prompt_path = Path(__file__).parent / "system_prompts" / "orchestrator_prompt.md"
    prompt = prompt_path.read_text()
    orchestrator_agent = Agent(
        model=llm,
        name="orchestsrator_agent",
        description="Orchestrator agent that coordinates data analysis tasks across multiple agents.",
        instruction=prompt,
        sub_agents=sub_agents,
        tools=tools
    )
    return orchestrator_agent


def create_tic_tac_toe_agent():
    prompt_path = Path(__file__).parent / "system_prompts" / "tic_tac_toe_prompt.md"
    prompt = prompt_path.read_text()
    tic_tac_toe_agent = Agent(
        model=llm,
        name="tic_tac_toe_agent",
        description="Agent that plays Tic-Tac-Toe with the user.",
        instruction=prompt
    )
    return tic_tac_toe_agent

# filesystem_toolset = create_filesystem_toolset()
# code_executor_toolset = create_python_code_executor_toolset()

tic_tac_toe_agent = create_tic_tac_toe_agent()
root_agent = create_orchestrator_agent(sub_agents=[tic_tac_toe_agent], tools=[])