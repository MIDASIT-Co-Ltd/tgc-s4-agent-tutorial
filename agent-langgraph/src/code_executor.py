#!/usr/bin/env python3
"""
Sandbox MCP Server for Code Execution

This MCP server provides tools for initializing and running Python code in a sandboxed environment.
It supports both local execution and WASM-based execution for enhanced security.
"""

import os
import json
import traceback
from typing import Optional, Union
import asyncio

from mcp.server.fastmcp import FastMCP

from smolagents.local_python_executor import LocalPythonExecutor
from smolagents.remote_executors import WasmExecutor
from smolagents.monitoring import AgentLogger

from src.config import SANDBOX_OUTPUT

# Global state to maintain executor instance
_executor: Optional[WasmExecutor] = None
_logger: Optional[AgentLogger] = None
_test: Optional[str] = None 
# Create FastMCP server
server = FastMCP("sandbox-code-executor", port=8001)

def initialize_code_executor(
    timeout: int = 30
) -> str:
    """Initialize a Python code executor (either local or WASM-based) for running code in a sandbox.
    
    Args:
        executor_type: Type of executor to initialize. 'local' for LocalPythonExecutor, 'wasm' for WasmExecutor (requires Deno)
        timeout: Timeout in seconds for code execution
    
    Returns:
        Status message indicating successful initialization
    """
    global _executor, _logger, _test

    _test = "test_val"
        
    try:
        # Create logger
        _logger = AgentLogger()
            
        # Initialize WasmExecutor with sandbox permissions
        additional_imports = ["plotly", "pandas", "numpy"]
        home_dir = os.getenv("HOME")
        deno_permissions = [
            "allow-net=0.0.0.0:8000,cdn.jsdelivr.net:443,pypi.org:443,files.pythonhosted.org:443,registry.npmjs.org:443",
            f"allow-read={home_dir}/.cache,{home_dir}/Library/Caches,{SANDBOX_OUTPUT}",
            f"allow-write={home_dir}/.cache,{home_dir}/Library/Caches,{SANDBOX_OUTPUT}",
        ]
        
        _executor = WasmExecutor(
            additional_imports=additional_imports,
            deno_permissions=deno_permissions,
            timeout=timeout,
            logger=_logger
        )
        result_msg = f"WasmExecutor initialized successfully with timeout={timeout}s and sandbox permissions"
            
        return f"{result_msg}\nSandbox output directory: {SANDBOX_OUTPUT}"
        
    except Exception as e:
        error_msg = f"Failed to initialize executor: {str(e)}\n{traceback.format_exc()}"
        return error_msg

initialize_code_executor()

@server.tool(
    name="reset_code_executor",
    description="Reinitialize the Python code executor with fresh state and optionally change the timeout setting. This clears all variables and resets the sandbox environment."
)
def reset_code_executor(timeout=30):
    initialize_code_executor(timeout=timeout)
    return "Code executor reset successfully."

@server.tool(
    name="run_python_code", 
    description="Execute Python code in the sandbox environment. Variables persist between executions."
)
def run_python_code(code: str, output_filename: Optional[str] = None) -> str:
    """Execute Python code in the initialized sandbox environment. Variables persist between executions.
    
    Args:
        code: Python code to execute in the sandbox
        output_filename: Optional filename to save the execution result to the sandbox workspace. If provided, the result will be written to SANDBOX_OUTPUT directory.
    
    Returns:
        Execution result with logs and optional file save confirmation
    """
    if _executor is None:
        return f"Error: No executor initialized. Please call initialize_code_executor first. {_test}"
    
    try:
        if not code.strip():
            return "Error: No code provided to execute."
        
        try:
            result = _executor.run_code_raise_errors(code)
            if hasattr(result, 'output'):
                execution_result = result.output
                logs = getattr(result, 'logs', '')
            else:
                execution_result = str(result)
                logs = ''
        except AttributeError:
            # Final fallback
            execution_result = str(_executor(code))
            logs = ''
        
        # Format the response
        response_parts = []
        
        # Add execution result
        if execution_result:
            response_parts.append(f"Result: {execution_result}")
        
        # Add logs if available
        if logs:
            response_parts.append(f"Logs:\n{logs}")
        
        response_text = "\n\n".join(response_parts) if response_parts else "Code executed successfully (no output)"
        
        # Save to file if requested
        if output_filename:
            try:
                output_path = os.path.join(SANDBOX_OUTPUT, output_filename)
                
                # Determine file format based on extension
                if output_filename.endswith('.json'):
                    with open(output_path, 'w', encoding='utf-8') as f:
                        json.dump(execution_result, f, indent=2, ensure_ascii=False)
                else:
                    # Save as text format
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(str(execution_result))
                
                response_text += f"\n\nOutput saved to: {output_path}"
                
            except Exception as file_error:
                response_text += f"\n\nWarning: Failed to save output to file: {str(file_error)}"
        
        return response_text
        
    except Exception as e:
        error_msg = f"Error executing code: {str(e)}\n{traceback.format_exc()}"
        return error_msg

if __name__ == "__main__":
    server.run("streamable-http")
    initialize_code_executor(timeout=30)