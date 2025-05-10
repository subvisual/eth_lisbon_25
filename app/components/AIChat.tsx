"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Typography,
  Flex,
  Spin,
  Row,
  Col,
  Statistic,
} from "antd";
import ReactMarkdown from "react-markdown";
import { GnosisYieldTable } from "./GnosisYieldTable";
import { TokenCard } from "./TokenCard";
const { Text } = Typography;

type ToolCall = {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
};

type ToolResult = {
  type: string;
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  result: any;
};

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
};

const calcFiatTotal = (data) => {
  let fiatTotal = 0;
  data.items.forEach((item: any) => {
    if (item.fiatBalance) {
      fiatTotal += Number(item.fiatBalance);
    }
  });
  return fiatTotal;
};

const SafeBalancesCard = ({ data }: { data: any }) => {
  return (
    <Card
      title="Token Balances"
      bordered={false}
      style={{ marginTop: 12 }}
      extra={
        calcFiatTotal(data) && (
          <Statistic
            title="Total Value"
            value={data.fiatTotal}
            precision={2}
            prefix="$"
            suffix="USD"
            valueStyle={{ color: "#3f8600" }}
          />
        )
      }
    >
      <Row gutter={[16, 16]}>
        {data.items.map((balance: any, index: number) => (
          <Col xs={24} key={index}>
            <TokenCard balance={balance} />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

// Render tool result based on tool name
const ToolResultRenderer = ({ toolResult }: { toolResult: ToolResult }) => {
  if (toolResult.toolName === "getGnosisYield") {
    return <GnosisYieldTable yieldData={toolResult.result} />;
  } else if (toolResult.toolName === "checkSafeBalances") {
    return <SafeBalancesCard data={toolResult.result} />;
  }

  // Fallback for unknown tool types
  return (
    <div style={{ fontSize: "0.9em", marginTop: 4 }}>
      <Text type="secondary">{toolResult.toolName}:</Text>
      <pre
        style={{
          marginTop: 4,
          background: "#f0f0f0",
          padding: 8,
          borderRadius: 4,
          overflow: "auto",
        }}
      >
        {JSON.stringify(toolResult.result, null, 2)}
      </pre>
    </div>
  );
};

// System prompt for financial analysis
const SYSTEM_PROMPT = `As a financial analysis assistant, follow these guidelines when responding to queries:

When you receive tool results with analytical data:
– Use bullet points for key insights
– Format percentages, monetary values, and other numerical data consistently
– Highlight significant changes or outliers in the data

For financial analysis:
– !IMPORTANT Always consider the user’s vault address and its specific context. If you don’t have the vault balance context, get the balance first before providing any analysis.
– Prioritize the most relevant metrics (APY, TVL, ROI, etc.)
– Compare values against benchmarks when available
– Analyze trends and patterns from a professional finance perspective
– Provide context for the numbers (e.g., “This APY is 2.3% higher than market average”)
– Check all the information at your disposal before providing an analysis, namely:
• All yields in liquidity pools;
• All yield strategies available at your disposal;

Workflow example:
– User: “What are the best yield strategies for my assets?”
– First check the vault balance and respective tokens;
– Then check all the yield strategies and liquidity pool yields for those specific tokens by calling the respective tools and passing the respective tokens as arguments;
– Finally, provide a detailed analysis of the best yield strategies available for the user’s vault based on the data and your instructions.

When displaying direct values or answers:
– Make important numbers stand out using formatting
– Organize information in a logical hierarchy
– Be concise and precise with financial terminology

Your available tools:
• getGnosisSafeBalances(addr: string)
Returns a JSON list of token symbols and balances held in the specified Gnosis Safe vault.

• getYieldStrategies()
Returns a JSON list of available yield strategies, each with token, APY, TVL, and ROI.

• getGnosisPoolsYield()
Returns a JSON list of liquidity‐pool yields on Gnosis, each with token, APY, TVL, and pool identifier.

Whenever the user asks “What are the best yield strategies for my assets?” or any variation, follow this exact workflow:

Fetch the vault balances
• Call getGnosisSafeBalances with parameter addr set to the user’s vault address (<USER_VAULT_ADDRESS>)
• Parse out all token symbols and their balances

Fetch yield strategies
• Call getYieldStrategies() with no parameters
• Collect APY, TVL, ROI, and any fees or lock‑up details

Fetch liquidity‑pool yields ← NEVER skip this
• Call getGnosisPoolsYield() with no parameters
• If the result is empty or missing pools for any token, respond:
“No liquidity pools found for [list of missing tokens]. Proceeding with yield‑strategy analysis only.”

Aggregate & analyze
• For each token from step 1, compare:
– Strategy APY vs. Pool APY
– TVL of top strategies vs. TVL of top pools
– ROI, fees, lock‑ups
• Highlight outliers and top 2–3 opportunities in bullet points:
• Token: XYZ
– Strategy “StakeXYZ”: 12.4% APY, TVL $45 M
– Pool “Curve‑XYZ”: 9.8% APY, TVL $30 M
– Benchmark: market average 8.5% (Strategy is +3.9%)

Final recommendation
• Rank your top pick(s) with concise rationale (“Best for TVL and low fees,” “Highest APY but moderate lock‑up,” etc.)
• Bold the key numbers and percentages

Example of tool‐call sequence:

getGnosisSafeBalances({ addr: “0xAbC…123” })
getYieldStrategies()
getGnosisPoolsYield()

Then deliver your professional, bullet‑pointed analysis. Ensure getGnosisPoolsYield is invoked every time before producing insights.
   
Always analyze from the perspective of an expert financial analyst, focusing on actionable insights rather than just raw data. The user vault address is: `;

export const AIChat = ({ safeAddress }: { safeAddress: string }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-prompt",
      role: "system",
      content: SYSTEM_PROMPT + safeAddress,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Create assistant message placeholder
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      // Send request to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages
            .concat(userMessage)
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText || "Failed to get response");
      }

      // Process the JSON response
      const responseData = await response.json();

      // Update the assistant message with the full data
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: responseData.content || "",
                toolCalls: responseData.toolCalls,
                toolResults: responseData.toolResults,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      title="AI Assistant"
      bordered={false}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      bodyStyle={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: 16,
          padding: "0 4px",
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={messages.filter((m) => m.role !== "system")}
          renderItem={(message) => {
            const isUser = message.role === "user";

            return (
              <List.Item
                style={{
                  padding: "8px 12px",
                  background: isUser ? "#f0f2f5" : "white",
                  borderRadius: 8,
                  marginBottom: 8,
                  textAlign: isUser ? "right" : "left",
                }}
              >
                <Flex vertical style={{ width: "100%" }}>
                  {/* Render tool results when available */}
                  {!isUser &&
                    message.toolResults &&
                    message.toolResults.length > 0 && (
                      <div
                        style={{
                          marginTop: 8,
                          borderRadius: 8,
                        }}
                      >
                        {message.toolResults.map((toolResult) => (
                          <ToolResultRenderer
                            key={toolResult.toolCallId}
                            toolResult={toolResult}
                          />
                        ))}
                      </div>
                    )}

                  <Text strong style={{ marginTop: 28 }}>
                    {isUser ? "You" : "Assistant"}
                  </Text>
                  <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </Flex>
              </List.Item>
            );
          }}
        />
        <div ref={messagesEndRef} />
        {isLoading && (
          <div style={{ textAlign: "center", padding: "10px" }}>
            <Spin size="small" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex" }}>
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your vaults or crypto..."
          disabled={isLoading}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          style={{ marginLeft: 8 }}
        >
          Send
        </Button>
      </form>
    </Card>
  );
};
