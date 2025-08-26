# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a tutorial project for building agents with LangGraph and CopilotKit, consisting of two main components:

- `agent-langgraph/` - Python-based agent implementation using LangGraph framework
- `ui/` - React UI component with CopilotKit integration

## Development Commands

### Python Agent (`agent-langgraph/`)
- Uses `uv` as the package manager
- Run the agent: `cd agent-langgraph && python main.py`
- Install dependencies: `cd agent-langgraph && uv sync`

### UI Components (`ui/`)
- Uses `pnpm` as the package manager
- Install dependencies: `cd ui && pnpm install`

## Architecture Overview

This is a tutorial project demonstrating multi-agent collaboration patterns:

- **Agent Implementation**: Located in `agent-langgraph/src/agent.py` (currently empty/placeholder)
- **Main Entry Point**: `agent-langgraph/main.py` contains a simple hello world implementation
- **UI Integration**: Uses CopilotKit React components for AI-powered UI interactions
- **Dependencies**: 
  - LangGraph v0.6.6+ for agent framework
  - CopilotKit v1.10.2+ for React UI components

The project references LangGraph's multi-agent collaboration tutorial as a learning resource.

## Key Files

- `agent-langgraph/CLAUDE_PROMPT.md` - Contains sample prompts and reference links
- `agent-langgraph/pyproject.toml` - Python project configuration with LangGraph dependency
- `ui/package.json` - Node.js dependencies for CopilotKit integration