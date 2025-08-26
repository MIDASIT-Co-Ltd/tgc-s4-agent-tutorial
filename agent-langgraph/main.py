import asyncio
from src.agent import run_agent_system


def main():
    print("Sample Data Visualization Agent")
    print("===============================")
    print("This system follows the README workflow:")
    print("1. User request -> Orchestrator receives message")
    print("2. Data generation agent generates data and stores in CSV")
    print("3. Orchestrator creates plotly script and exports JSON")
    print("4. Orchestrator invokes frontend action to display chart")
    
    # Example requests
    examples = [
        "Show me sales performance data with revenue trends",
        "Generate customer analytics data and display satisfaction scores",
        "Create a financial market chart with price movements",
        "Display scientific research data with temperature patterns",
        "Show e-commerce product metrics with conversion analysis"
    ]
    
    print("\n=== Example Requests ===")
    for i, example in enumerate(examples, 1):
        print(f"{i}. {example}")
    
    try:
        print("\nChoose an example (1-5) or enter your own request:")
        choice = input("> ").strip()
        
        if choice.isdigit() and 1 <= int(choice) <= 5:
            user_request = examples[int(choice) - 1]
        elif choice:
            user_request = choice
        else:
            user_request = examples[0]  # Default
        
        print(f"\n🚀 Processing request: {user_request}")
        print("=" * 50)
        
        # Run the agent system
        result = asyncio.run(run_agent_system(user_request))
        
        print("\n✅ Agent Workflow Complete!")
        print("=" * 50)
        
        # Display results
        print(f"\n📊 Workflow Status:")
        print(f"Current step: {result.get('current_step', 'Unknown')}")
        
        print(f"\n💬 Agent Messages ({len(result.get('messages', []))} total):")
        for i, msg in enumerate(result.get('messages', []), 1):
            content = msg.content[:100] + "..." if len(msg.content) > 100 else msg.content
            print(f"{i}. {content}")
            
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
