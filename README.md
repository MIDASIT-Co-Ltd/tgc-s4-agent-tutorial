# TGC S4 Agent Application Development Tutorial - Google ADK + CopilotKit Integration


## Quick Start

### 1. OpenAI API Key 추가
agents-python/agent-adk/.env 파일 생성 후 아래와 같이 API Key 추가
```env
OPENAI_API_KEY=<공유받은 API Key>
```

### 2. Agent Server Setup

```bash
cd agent-python
cd agent-adk

# Install dependencies
uv sync
```

### 3. Start Agent Server
```bash
uv run agent_server_runner.py
```

### 4. Frontend UI Setup

```bash
cd ui-adk

# Install dependencies
pnpm install
```

### 5. Start Frontend Server

```bash
# Development mode (recommended for development)
pnpm run dev

# OR

# Production mode (requires build first)
pnpm run build
pnpm run start
```

The frontend will be available at `http://localhost:3000` (or the port shown in the terminal).