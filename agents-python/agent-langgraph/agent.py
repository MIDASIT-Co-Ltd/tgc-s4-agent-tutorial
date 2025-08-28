# https://docs.copilotkit.ai/langgraph/frontend-actions
# https://docs.langchain.com/oss/python/models

import os
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, TypedDict, List, Literal
from pathlib import Path
import json
import asyncio

from langgraph.graph import MessagesState, StateGraph, START, END
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage, SystemMessage
from langchain_core.tools import tool
from langchain_core.language_models import BaseChatModel
from langgraph.prebuilt import create_react_agent
from langgraph_supervisor.supervisor import _make_call_agent
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt.chat_agent_executor import (
    AgentState,
    AgentStateWithStructuredResponse,
    Prompt,
    StateSchemaType,
    StructuredResponseSchema,
    _should_bind_tools,
    create_react_agent,
)
from langgraph.runtime import Runtime
from copilotkit.langgraph import CopilotKitProperties 
from config import LLM

TEMP_DIR = os.getenv("TEMP_DIR", "tmp")
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

try:
    from langchain_mcp_adapters.client import MultiServerMCPClient
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False
    print("Warning: langchain-mcp-adapters not available. Install it for full functionality.")

sandbox_mcp = MultiServerMCPClient(
    {
        "sandbox": {
            "url": "http://localhost:8001/mcp",
            "transport": "streamable_http",
        }
    }
)

filesystem_mcp = MultiServerMCPClient({
    "filesystem": {
                "command": "npx",
                "args": [
                    "-y",
                    "@modelcontextprotocol/server-filesystem",
                    str(TEMP_DIR)  # Allow access to current directory
                ],
                "transport": "stdio"
            }
})


def get_cwd():
    """Get current working directory."""
    return str(SANDBOX_OUTPUT)


def get_mcp_tools(mcp_client):
    """Get tools from MCP servers."""
    try:
        # Get available tools from MCP servers
        tools = asyncio.run(mcp_client.get_tools())
        return tools
        
    except Exception as e:
        print(f"Warning: Could not connect to MCP servers: {e}")
        return []


# Create the Data Generation Agent
def create_data_generation_agent():
    """Create data generation agent with MCP tools."""
    # Load system prompt
    prompt_path = Path(__file__).parent / "system_prompts" / "data_generation_prompt.md"
    if prompt_path.exists():
        prompt = SystemMessage(prompt_path.read_text())
    else:
        raise FileNotFoundError("Data generation prompt file not found.")
    tools = get_mcp_tools(filesystem_mcp) + [get_cwd]
    return create_react_agent(LLM, tools, prompt=prompt, name="data_gen_agent")


class AgentStateWithCopilkitProperties(AgentState):
    copilotkit: CopilotKitProperties



# Create the Orchestrator Agent  
def create_orchestrator_agent(agents, agent_name="orchestrator",  output_mode: Literal["full_history", "last_message"] = "last_message",):
    """Create orchestrator agent with MCP tools."""
    # Load system prompt
    prompt_path = Path(__file__).parent / "system_prompts" / "orchestrator_prompt.md"
    if prompt_path.exists():
        prompt = SystemMessage(prompt_path.read_text())
    else:
        raise FileNotFoundError("Orchestrator prompt file not found.")

    # Get tools for this agent
    tools = get_mcp_tools(sandbox_mcp) + get_mcp_tools(filesystem_mcp) + [get_cwd]
    
    # Create a memory checkpointer for state persistence
    checkpointer = MemorySaver()
    
    def bind_tools_to_model(state: AgentStateWithCopilkitProperties, runtime: Runtime) -> BaseChatModel:
        actions = state.get("copilotkit", {}).get("actions", [])
        all_tools = tools + actions
        model = LLM.bind_tools(all_tools)
        return model
    
    state_schema = AgentStateWithCopilkitProperties

    supervisor_agent = create_react_agent(
        name=agent_name,
        model=bind_tools_to_model,
        tools=tools,
        prompt=prompt,
        state_schema=state_schema,
    )

    agent_names = set()
    for agent in agents:
        if agent.name is None or agent.name == "LangGraph":
            raise ValueError(
                "Please specify a name when you create your agent, either via `create_react_agent(..., name=agent_name)` "
                "or via `graph.compile(name=name)`."
            )

        if agent.name in agent_names:
            raise ValueError(
                f"Agent with name '{agent.name}' already exists. Agent names must be unique."
            )

        agent_names.add(agent.name)

    builder = StateGraph(state_schema)
    builder.add_node(supervisor_agent, destinations=tuple(agent_names) + (END,))
    builder.add_edge(START, supervisor_agent.name)
    for agent in agents:
        builder.add_node(
            agent.name,
            _make_call_agent(
                agent,
                output_mode,
                add_handoff_back_messages=None,
                supervisor_name=agent_name,
            ),
        )
        builder.add_edge(agent.name, supervisor_agent.name)

    return builder.compile(checkpointer = checkpointer)


AGENT_DESCRIPTIONS = {
    "orchestrator": "Orchestrator agent for managing workflows.",
    "data_generation": "Data generation agent for creating synthetic data."
}



data_gen_agent = create_data_generation_agent()

orchestrator_agent = create_orchestrator_agent([data_gen_agent])


async def main():
    message = "Test simple hello world code execution."
    # message = "Show me weekly temperature forecast."
    response = orchestrator_agent.astream(
        {"messages": [{"role": "user", "content": message}]}
    )
    async for chunk in response:
        print(chunk)

if __name__ == "__main__":
    asyncio.run(main())