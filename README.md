# TGC S4 Agent Tutorial - LangGraph + CopilotKit Integration

A tutorial project demonstrating multi-agent collaboration using LangGraph with a CopilotKit-powered chat interface for data visualization.


## Quick Start

### 1. Backend Setup (Python Agent)

```bash
cd agent-langgraph

# Install dependencies
uv sync

# Start the code execution MCP server (Terminal 1)
uv run src/code_executor

# In another terminal, start the FastAPI server (Terminal 2)
uv run src/endpoint.py
```

The backend will be available at `http://localhost:8007` (configurable via `LANGGRAPH_ENDPOINT_PORT`)

### 2. Frontend Setup (React UI)

```bash
cd frontend

# Install dependencies
yarn install

# Start the development server
yarn dev
```

The frontend will be available at `http://localhost:3000`

## Features

### > Multi-Agent System
- **Orchestrator Agent**: Coordinates the workflow and handles user requests
- **Data Generation Agent**: Creates realistic sample datasets using AI reasoning
- **Safe Code Execution**: Uses MCP sandbox servers for secure Python execution

### =� CopilotKit Chat Interface
- **Popup Chat**: Bottom-right corner chat popup (keyboard shortcut: `Cmd/Ctrl + /`)
- **Smart Integration**: Connects directly to the LangGraph agents via FastAPI
- **Custom Instructions**: Tailored for data visualization assistance
- **Responsive Design**: Works across different screen sizes

### =� Data Visualization Capabilities
- Generate realistic sample data for various domains (sales, customer analytics, financial, etc.)
- Create interactive Plotly visualizations using AI reasoning
- Export charts as JSON for frontend integration
- No hardcoded templates - everything is AI-generated

## Usage Examples

Start a conversation with the AI assistant by clicking the chat popup or pressing `Cmd/Ctrl + /`. Try requests like:

- "Show me sales trends by region"
- "Create a customer analytics dashboard"
- "Generate a monthly revenue chart"
- "Show temperature data over the past year"

The system will:
1. Understand your visualization request
2. Generate appropriate sample data using AI
3. Create interactive Plotly charts
4. Execute everything safely in sandbox environments

## Architecture

### Backend (Python)
- **LangGraph**: Multi-agent coordination framework
- **FastAPI**: Web server with CopilotKit endpoint at `/copilotkit`
- **MCP Tools**: Model Context Protocol for secure tool access
- **Sandbox Execution**: Safe Python code execution environment

### Frontend (React)
- **Next.js 14**: React framework with App Router
- **CopilotKit**: Chat interface and LLM integration
- **TypeScript**: Type-safe development
- **Custom Styling**: Responsive design with gradient backgrounds

### Integration
- Frontend connects to backend via `/api/copilotkit` endpoint
- Next.js proxy configuration handles CORS
- Real-time streaming between chat interface and agents

## Development

### Backend Commands
- `uv run src/code_executor` - Start MCP sandbox server (required first)
- `uv run src/endpoint.py` - Start FastAPI server with agent endpoint
- `uv run src/agent.py` - Run agent directly (for testing)

### Frontend Commands
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server

## Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```
AGENT_SERVICE=langgraph  # or openai
AGENT_NAME=agent         # agent name when using langgraph
OPENAI_API_KEY=your_key  # required when AGENT_SERVICE=openai
```

**Agent Service Configuration:**
- When `AGENT_SERVICE=langgraph`: Frontend uses the agent service implemented in `agents-python/agent-langgraph`
- When `AGENT_SERVICE=openai`: Frontend directly uses OpenAI API without agent service

**System Endpoints:**
- Backend: `http://localhost:8007` (configurable via `LANGGRAPH_ENDPOINT_PORT`)
- Frontend: `http://localhost:3000`
- MCP Server: `http://localhost:8001` (for sandbox execution)

**Optional Configuration:**
- `LANGGRAPH_ENDPOINT_PORT=8007` - Set custom port for the FastAPI server
- `REMOTE_ACTION_URL` - Override default agent endpoint URL

### Customization
- **Agent Instructions**: Modify system prompts in `agents-python/agent-langgraph/src/system_prompts/`
- **Chat Appearance**: Update CopilotPopup props in `frontend/src/app/page.tsx`
- **Styling**: Edit `frontend/src/app/globals.css` for custom themes

## Technologies

- **Backend**: Python, LangGraph, FastAPI, LangChain, MCP
- **Frontend**: React, Next.js, TypeScript, CopilotKit
- **AI/LLM**: Supports various LLM providers via LangChain adapters
- **Visualization**: Plotly for interactive charts
- **Sandbox**: WebAssembly-based code execution (smolagents)

## Learning Objectives

This tutorial demonstrates:
- Multi-agent system architecture and coordination
- Safe AI code generation and execution
- Frontend-backend integration for AI applications
- Real-time chat interfaces with LLM agents
- Data visualization through AI reasoning
- Production-ready agent deployment patterns

---

For detailed implementation information, see the README files in individual directories:
- [Backend README](./agents-python/agent-langgraph/README.md)
- [Frontend package.json](./frontend/package.json)