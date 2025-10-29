from pathlib import Path
from google.adk.models.lite_llm import LiteLlm
from google.adk.agents.llm_agent import Agent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams, SseConnectionParams
from mcp import StdioServerParameters

model_name = "openai/gpt-5-mini"
llm = LiteLlm(model=model_name, timeout=180, stream_options={"include_usage": True})

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

def create_data_generation_agent():
    prompt_path = Path(__file__).parent / "system_prompts" / "data_generation_prompt.md"
    prompt = prompt_path.read_text()
    data_gen_agent = Agent(
        model=llm,
        name="data_generation_agent",
        description="Agent that generates synthetic datasets based on user specifications for demonstration purposes.",
        instruction=prompt
    )
    return data_gen_agent

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

data_gen_agent = create_data_generation_agent()
filesystem_toolset = create_filesystem_toolset()
code_executor_toolset = create_python_code_executor_toolset()
root_agent = create_orchestrator_agent(sub_agents=[data_gen_agent], tools=[filesystem_toolset, code_executor_toolset])