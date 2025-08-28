import os
from pathlib import Path
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_deepseek import ChatDeepSeek
from dotenv import load_dotenv

if not os.path.exists(".env"):
    ENV_FILE_PATH = os.path.join(str(Path(__file__).parent.parent.resolve()), ".env")
    if not os.path.exists(ENV_FILE_PATH):
        raise ValueError("Environment variable file not found")
else:
    ENV_FILE_PATH = ".env"

load_dotenv(ENV_FILE_PATH)

TEMP_DIR = os.getenv("TEMP_DIR", "tmp")
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

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



