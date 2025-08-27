# Sample Data Visualization Agent System

## System Overview

This project demonstrates a **multi-agent collaboration system** using LangGraph that creates data visualizations through intelligent agent coordination. The system establishes a practical example of how LLM agents can work together to:

1. **Understand user visualization requests**
2. **Generate appropriate sample data using AI reasoning**
3. **Create interactive visualizations programmatically**
4. **Execute code safely in sandboxed environments**
5. **Coordinate through proper agent communication**

## Key Learning Objectives

- **Multi-Agent Architecture**: Implementing agent specialization and coordination
- **MCP Tool Integration**: Using Model Context Protocol servers for safe code execution and file operations
- **LLM-Powered Data Generation**: Agents that reason about and create realistic datasets
- **Safe Code Execution**: Using sandbox environments for dynamic Python code execution
- **Frontend Integration**: Connecting AI-generated visualizations to UI components

## Architecture

### Orchestrator Agent
The orchestrator coordinates the entire visualization workflow. It:
- Receives user visualization requests
- Coordinates with the data generation agent
- Generates Python Plotly code using AI reasoning
- Executes code safely in sandbox environments
- Exports visualizations as JSON for frontend consumption
- Invokes frontend actions to display charts

System prompt is defined in `src/system_prompts/orchestrator_prompt.md`

### Sample Data Generation Agent
This agent creates realistic sample datasets using AI reasoning. It:
- Analyzes user requests to understand data requirements
- Uses LLM reasoning to create appropriate data structures
- Generates realistic sample data with proper relationships
- Executes Python code in sandbox environments to create CSV files
- Ensures data quality and appropriate formats

System prompt is defined in `src/system_prompts/data_generation_prompt.md`

## Sample Data Types Generated

The system can generate various types of realistic sample data:

### Sales Performance Data
- Monthly sales figures across different product categories
- Regional performance metrics with revenue, units sold, and growth rates
- Time series data showing trends over 12-24 months

### Customer Analytics Data
- Customer demographics (age groups, locations, spending patterns)
- Customer journey data (acquisition channels, retention rates, lifetime value)
- Segmentation data for targeted marketing analysis

### Financial Market Data
- Stock price movements with OHLC (Open, High, Low, Close) data
- Trading volume and market volatility indicators
- Portfolio performance across different asset classes

### Scientific/Research Data
- Temperature and weather patterns over time
- Survey responses with categorical and numerical data
- Experimental results with control and test groups

### E-commerce Data
- Product performance metrics (views, conversions, ratings)
- Seasonal sales patterns and inventory levels
- User behavior analytics (page views, session duration, bounce rates) 


## Technical Implementation

### MCP Tools Integration
The system uses **Model Context Protocol (MCP)** servers to provide secure, standardized tool access. Tools are integrated using `MultiServerMCPClient` as documented in the [LangGraph MCP documentation](https://langchain-ai.github.io/langgraph/agents/mcp/#use-mcp-tools).

This approach provides:
- **Safe code execution** in isolated environments
- **Standardized file operations** across different systems
- **Extensible tool architecture** for adding new capabilities
- **Proper security boundaries** between agents and system resources
### Sandbox tools for code execution

#### Sandbox MCP Server

The Code Execution Sandbox MCP Server (`src/code_executor.py`) provides secure Python code execution using the web assembly code executor from the smolagents library (https://github.com/huggingface/smolagents).

**Available tools:**
- `initialize_code_executor` - Initialize the code execution environment
- `run_python_code` - Execute Python code with optional output file saving

#### Starting the Sandbox MCP Server

```bash
uv run src/code_executor
```

**Important notes:**
- The server runs on port 8000 using streamable-http transport
- stdio transport is not supported (reason not known)
- Ensure port 8000 is available before starting the server 


### Filesystem tools
### Setup Filesystem MCP server
Add MCP tools. 
```
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "</path/to/allowed/dir>",
        "</path/to/other/allowed/dir>",
        ...
      ]
    }
  }
}
```

## System Workflow

The system follows this intelligent workflow:

1. **User Request**: User submits a visualization request (e.g., "Show me sales trends by region")
2. **Agent Coordination**: Orchestrator agent receives and analyzes the request
3. **Data Generation**: Data generation agent:
   - Reasons about appropriate data structure
   - Generates Python code to create realistic sample data
   - Executes code in sandbox environment
   - Saves data to CSV file in `/menv` directory
4. **Visualization Creation**: Orchestrator agent:
   - Reads the generated CSV data
   - Creates appropriate Plotly Python code using AI reasoning
   - Executes visualization code in sandbox environment
   - Exports chart as Plotly JSON file
5. **Frontend Integration**: Orchestrator invokes frontend action to display the visualization

This workflow demonstrates **true AI collaboration** where agents use reasoning and code generation rather than predefined templates.

## What This System Establishes

This tutorial system establishes several important concepts:

### 1. **Agent Specialization & Coordination**
- Demonstrates how to create specialized agents with distinct responsibilities
- Shows proper agent-to-agent communication patterns
- Implements coordinated workflows using LangGraph

### 2. **Safe AI Code Execution**
- Uses MCP sandbox servers for secure Python code execution
- Demonstrates how AI agents can generate and run code safely
- Shows proper isolation between AI reasoning and system execution

### 3. **Dynamic Content Generation**
- Agents use LLM reasoning to create appropriate data and visualizations
- No hardcoded templates - everything is generated based on user context
- Demonstrates AI creativity in data structure and visualization design

### 4. **Production-Ready Architecture**
- Uses industry-standard MCP protocols for tool integration
- Implements proper error handling and fallback mechanisms
- Shows how to integrate AI agents with frontend applications

### 5. **Extensible Framework**
- Architecture supports adding new agent types and tools
- MCP integration allows easy addition of new capabilities
- System can be extended for different data types and visualization formats



## API Endpoint

### CopilotKit Integration
The project includes a FastAPI server (`endpoint.py`) that exposes the orchestrator agent through a CopilotKit-compatible API endpoint.

**Prerequisites:**
First, start the code execution MCP server:
```bash
uv run src/code_executor.py
```

**Starting the API Server:**
```bash
uv run src/endpoint.py
```

**Available Endpoints:**
- `/copilotkit` - CopilotKit agent endpoint for UI integration
- `/health` - Health check endpoint

The server runs on port 8000 by default (configurable via `PORT` environment variable) and provides a bridge between the LangGraph agents and CopilotKit-powered frontend applications.

## Resources

### Langgraph Multi-Agent Example
https://github.com/langchain-ai/langgraph/blob/main/docs/docs/tutorials/multi_agent/agent_supervisor.md


### Langgraph MCP Tools Use Exmple
https://langchain-ai.github.io/langgraph/agents/mcp/#use-mcp-tools

### microsandbox
https://github.com/microsandbox/microsandbox

### filesystem MCP by Anthropic
https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem