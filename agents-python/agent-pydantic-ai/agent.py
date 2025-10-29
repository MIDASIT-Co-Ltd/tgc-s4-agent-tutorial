from pathlib import Path
from pydantic_ai import Agent, RunContext
from pydantic_ai.usage import UsageLimits
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.deepseek import DeepSeekProvider
from dotenv import load_dotenv
ENV_PATH = str(Path(__file__).parent.parent / ".env")
load_dotenv(ENV_PATH)  # Load environment variables from a .env file if present

model = OpenAIChatModel(
    'deepseek-chat',
    provider=DeepSeekProvider(),
)

def history_processor(messages):
    return messages


joke_selection_agent = Agent(  
    model,
    system_prompt=(
        'Use the `joke_factory` to generate some jokes, then choose the best. '
        'You must return just a single joke.'
    ),
    history_processors=[history_processor]
)

joke_generation_agent = Agent(  
    model, output_type=list[str]
)


@joke_selection_agent.tool
async def joke_factory(ctx: RunContext[None], count: int) -> list[str]:
    """
    This agent may be used to generate a list of jokes.
    """
    r = await joke_generation_agent.run(  
        f'Please generate {count} jokes.',
        usage=ctx.usage,  
    )
    return r.output  


result = joke_selection_agent.run_sync(
    'Tell me a joke.',
    usage_limits=UsageLimits(request_limit=10, total_tokens_limit=500000),
)
print(result.output)
#> Did you hear about the toothpaste scandal? They called it Colgate.
print(result.usage())
result_2 = joke_selection_agent.run_sync(
    'who is your father?',
    usage_limits=UsageLimits(request_limit=10, total_tokens_limit=500000),
)
result_3 = joke_selection_agent.run_sync(
    'who is your mother?',
    usage_limits=UsageLimits(request_limit=10, total_tokens_limit=500000),
)
#> RunUsage(input_tokens=204, output_tokens=24, requests=3)