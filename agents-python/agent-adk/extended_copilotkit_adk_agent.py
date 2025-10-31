"""Extended CopilotKit ADKAgent implementation that propagates frontend tools to subagents.

This module provides an extended version of the ADKAgent that ensures frontend tools
and system messages are applied not only to the main agent but also to all subagents
in the agent hierarchy.
"""

from typing import Optional
import asyncio
import logging
import inspect

from ag_ui_adk import ADKAgent
from ag_ui.core import RunAgentInput, SystemMessage
from google.adk.agents import BaseAgent

logger = logging.getLogger(__name__)


class ExtendedCopilotKitADKAgent(ADKAgent):
    """Extended CopilotKit ADKAgent that applies frontend tools to subagents as well.

    This class extends the standard ADKAgent to propagate frontend tool registration
    to all subagents in the agent hierarchy, enabling consistent tool availability
    across the entire agent system.
    """

    def __init__(
        self,
        extend_frontend_actions_to_subagents: bool = True,
        **kwargs
    ):
        """Initialize the ExtendedCopilotKitADKAgent.

        Args:
            extend_frontend_actions_to_subagents: If True, applies frontend tools
                to all subagents in addition to the main agent. Default is True.
            **kwargs: All other arguments are passed to the parent ADKAgent class.
        """
        super().__init__(**kwargs)
        self._extend_frontend_actions_to_subagents = extend_frontend_actions_to_subagents

    def _apply_modifications_to_agent(
        self,
        agent: BaseAgent,
        agent_updates: dict,
        system_content: Optional[str] = None
    ) -> BaseAgent:
        """Apply instruction and tool modifications to a single agent.

        Args:
            agent: The agent to modify
            agent_updates: Dictionary containing 'tools' and/or 'instruction' updates
            system_content: Optional system message content for instruction wrapping

        Returns:
            Modified agent copy
        """
        local_updates = {}

        # Handle instruction updates
        if 'instruction' in agent_updates and system_content:
            current_instruction = getattr(agent, 'instruction', '') or ''

            if callable(current_instruction):
                # Handle instructions provider
                if inspect.iscoroutinefunction(current_instruction):
                    # Async instruction provider
                    async def instruction_provider_wrapper_async(*args, **kwargs):
                        instructions = system_content
                        original_instructions = await current_instruction(*args, **kwargs) or ''
                        if original_instructions:
                            instructions = f"{original_instructions}\n\n{instructions}"
                        return instructions
                    local_updates['instruction'] = instruction_provider_wrapper_async
                else:
                    # Sync instruction provider
                    def instruction_provider_wrapper_sync(*args, **kwargs):
                        instructions = system_content
                        original_instructions = current_instruction(*args, **kwargs) or ''
                        if original_instructions:
                            instructions = f"{original_instructions}\n\n{instructions}"
                        return instructions
                    local_updates['instruction'] = instruction_provider_wrapper_sync
            else:
                # Handle string instructions
                if current_instruction:
                    local_updates['instruction'] = f"{current_instruction}\n\n{system_content}"
                else:
                    local_updates['instruction'] = system_content

        # Handle tool updates
        if 'tools' in agent_updates:
            # Get existing tools from this agent
            existing_tools = []
            if hasattr(agent, 'tools') and agent.tools:
                existing_tools = list(agent.tools) if isinstance(agent.tools, (list, tuple)) else [agent.tools]

            # Extract the toolset from agent_updates (it's the last item in combined_tools)
            combined_tools_from_updates = agent_updates['tools']
            if combined_tools_from_updates:
                # The toolset is the last item that was added in _start_background_execution
                toolset = combined_tools_from_updates[-1]

                # Combine this agent's existing tools with the new toolset
                local_updates['tools'] = existing_tools + [toolset]
                logger.debug(f"Applied {len(existing_tools)} existing tools + toolset to agent {agent.name}")

        # Create modified agent copy if we have updates
        if local_updates:
            return agent.model_copy(update=local_updates)

        return agent

    async def _start_background_execution(
        self,
        input: RunAgentInput
    ):
        """Start ADK execution in background with tool support for main agent and subagents.

        This overrides the parent method to apply frontend tools and system messages
        to both the main agent and all subagents when extend_frontend_actions_to_subagents is True.

        Args:
            input: The run input

        Returns:
            ExecutionState tracking the background execution
        """
        # Import here to avoid circular dependency issues
        from ag_ui_adk.client_proxy_toolset import ClientProxyToolset
        from ag_ui_adk.execution_state import ExecutionState

        event_queue = asyncio.Queue()
        logger.debug(f"Created event queue {id(event_queue)} for thread {input.thread_id}")

        # Extract necessary information
        user_id = self._get_user_id(input)
        app_name = self._get_app_name(input)

        # Use the ADK agent directly
        adk_agent = self._adk_agent

        # Prepare agent modifications (SystemMessage and tools)
        agent_updates = {}
        system_content = None

        # Handle SystemMessage if it's the first message - append to agent instructions
        if input.messages and isinstance(input.messages[0], SystemMessage):
            system_content = input.messages[0].content
            if system_content:
                current_instruction = getattr(adk_agent, 'instruction', '') or ''

                if callable(current_instruction):
                    # Handle instructions provider
                    if inspect.iscoroutinefunction(current_instruction):
                        # Async instruction provider
                        async def instruction_provider_wrapper_async(*args, **kwargs):
                            instructions = system_content
                            original_instructions = await current_instruction(*args, **kwargs) or ''
                            if original_instructions:
                                instructions = f"{original_instructions}\n\n{instructions}"
                            return instructions
                        new_instruction = instruction_provider_wrapper_async
                    else:
                        # Sync instruction provider
                        def instruction_provider_wrapper_sync(*args, **kwargs):
                            instructions = system_content
                            original_instructions = current_instruction(*args, **kwargs) or ''
                            if original_instructions:
                                instructions = f"{original_instructions}\n\n{instructions}"
                            return instructions
                        new_instruction = instruction_provider_wrapper_sync

                    logger.debug(
                        f"Will wrap callable InstructionProvider and append SystemMessage: '{system_content[:100]}...'")
                else:
                    # Handle string instructions
                    if current_instruction:
                        new_instruction = f"{current_instruction}\n\n{system_content}"
                    else:
                        new_instruction = system_content
                    logger.debug(f"Will append SystemMessage to string instructions: '{system_content[:100]}...'")

                agent_updates['instruction'] = new_instruction

        # Create dynamic toolset if tools provided and prepare tool updates
        toolset = None
        if input.tools:

            # Get existing tools from the agent
            existing_tools = []
            if hasattr(adk_agent, 'tools') and adk_agent.tools:
                existing_tools = list(adk_agent.tools) if isinstance(adk_agent.tools, (list, tuple)) else [adk_agent.tools]

            # if same tool is defined in frontend and backend then agent will only use the backend tool
            input_tools = []
            for input_tool in input.tools:
                # Check if this input tool's name matches any existing tool
                # Also exclude this specific tool call "transfer_to_agent" which is used internally by the adk to handoff to other agents
                if (not any(hasattr(existing_tool, '__name__') and input_tool.name == existing_tool.__name__
                        for existing_tool in existing_tools) and input_tool.name != 'transfer_to_agent'):
                    input_tools.append(input_tool)

            toolset = ClientProxyToolset(
                ag_ui_tools=input_tools,
                event_queue=event_queue
            )

            # Combine existing tools with our proxy toolset
            combined_tools = existing_tools + [toolset]
            agent_updates['tools'] = combined_tools
            logger.debug(f"Will combine {len(existing_tools)} existing tools with proxy toolset")

        # Create a single copy of the agent with all updates if any modifications needed
        if agent_updates:
            adk_agent = adk_agent.model_copy(update=agent_updates)
            logger.debug(f"Created modified agent copy with updates: {list(agent_updates.keys())}")

            # NEW: Apply modifications to subagents if enabled
            if self._extend_frontend_actions_to_subagents and hasattr(adk_agent, 'sub_agents') and adk_agent.sub_agents:
                modified_sub_agents = []
                for sub_agent in adk_agent.sub_agents:
                    modified_sub_agent = self._apply_modifications_to_agent(
                        sub_agent,
                        agent_updates,
                        system_content
                    )
                    modified_sub_agents.append(modified_sub_agent)
                    logger.debug(f"Applied modifications to sub-agent: {sub_agent.name}")

                # Update the main agent with modified sub_agents
                adk_agent = adk_agent.model_copy(update={'sub_agents': modified_sub_agents})
                logger.debug(f"Updated main agent with {len(modified_sub_agents)} modified sub-agents")

        # Create background task
        logger.debug(f"Creating background task for thread {input.thread_id}")
        task = asyncio.create_task(
            self._run_adk_in_background(
                input=input,
                adk_agent=adk_agent,
                user_id=user_id,
                app_name=app_name,
                event_queue=event_queue
            )
        )
        logger.debug(f"Background task created for thread {input.thread_id}: {task}")

        return ExecutionState(
            task=task,
            thread_id=input.thread_id,
            event_queue=event_queue
        )
