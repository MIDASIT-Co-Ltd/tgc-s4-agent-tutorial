import os
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, TypedDict, List
from pathlib import Path
import json
import asyncio

from langgraph.graph import MessagesState, StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langgraph_supervisor import create_supervisor
from src.config import LLM, SANDBOX_OUTPUT, ENV_FILE_PATH

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
                    str(SANDBOX_OUTPUT)  # Allow access to current directory
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


# Create the Orchestrator Agent  
def create_orchestrator_agent():
    """Create orchestrator agent with MCP tools."""
    # Load system prompt
    prompt_path = Path(__file__).parent / "system_prompts" / "orchestrator_prompt.md"
    if prompt_path.exists():
        prompt = SystemMessage(prompt_path.read_text())
    else:
        raise FileNotFoundError("Orchestrator prompt file not found.")

    # Get tools for this agent
    tools = get_mcp_tools(sandbox_mcp) + get_mcp_tools(filesystem_mcp) + [get_cwd]
    
    return create_supervisor(
        agents=[
        #    data_gen_agent
        ], model=LLM, tools=tools, prompt=prompt, 
        add_handoff_back_messages=True,
        output_mode="last_message",
    ).compile(name="orchestrator")


AGENT_DESCRIPTIONS = {
    "orchestrator": "Orchestrator agent for managing workflows.",
    "data_generation": "Data generation agent for creating synthetic data."
}



data_gen_agent = create_data_generation_agent()

orchestrator_agent = create_orchestrator_agent()


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