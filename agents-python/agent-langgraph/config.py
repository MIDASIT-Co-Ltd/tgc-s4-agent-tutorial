import os
from pathlib import Path
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_deepseek import ChatDeepSeek

PROJECT_PATH = os.getenv("PROJECT_PATH")
if not PROJECT_PATH:
    PROJECT_PATH = str(Path(__file__).parent.parent.resolve())
ENV_FILE_PATH = os.path.join(PROJECT_PATH, ".env")
if not os.path.exists(ENV_FILE_PATH):
    raise ValueError("Environment variable file not found")

SANDBOX_OUTPUT = os.path.join(os.getenv("PROJECT_PATH", os.getcwd()), "sandbox_output")
if not os.path.exists(SANDBOX_OUTPUT):
    os.makedirs(SANDBOX_OUTPUT)

# LLM = ChatAnthropic(model="claude-sonnet-4-20250514")
# LLM = ChatDeepSeek(model="deepseek-chat")
# LLM = ChatOpenAI(model="gpt-5")

def get_openrouter_llm(model):
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if openrouter_api_key is None:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    llm = ChatOpenAI(
        model=model, 
        base_url="https://openrouter.ai/api/v1",
        api_key=openrouter_api_key
    )
    return llm

LLM = get_openrouter_llm("moonshotai/kimi-k2")



