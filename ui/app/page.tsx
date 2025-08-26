"use client";

import { CopilotPopup } from "@copilotkit/react-ui";

export default function Home() {
  return (
    <main className="container">
      <div className="hero">
        <h1>Data Visualization Agent</h1>
        <p>
          An intelligent multi-agent system powered by LangGraph that creates data visualizations 
          through AI-driven collaboration. Ask for charts, graphs, and data insights using natural language.
        </p>
      </div>

      <CopilotPopup
        instructions="You are an intelligent data visualization assistant. You can help users create charts, generate sample data, and provide insights about data visualization. You work with a multi-agent system that includes data generation and visualization specialists. Be helpful, clear, and guide users through creating meaningful visualizations."
        labels={{
          title: "Data Viz Assistant",
          initial: "Hi! 👋 I'm your data visualization assistant. I can help you create charts, generate sample data, and build interactive visualizations. What would you like to visualize today?",
        }}
        defaultOpen={false}
        clickOutsideToClose={true}
        hitEscapeToClose={true}
        shortcut="/"
      />
    </main>
  );
}