import "./globals.css";
import { ReactNode } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export const metadata = {
  title: "Data Visualization Agent - CopilotKit Demo",
  description: "A sample data visualization agent powered by LangGraph and CopilotKit",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit" agent="agent">
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}