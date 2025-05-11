"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, Input, Button, List, Typography, Flex, Spin } from "antd";
import ReactMarkdown from "react-markdown";
import { GnosisYieldTable } from "./GnosisYieldTable";
import { SafeBalancesCard } from "./SafeBalancesCard";
const { Text } = Typography;
import { SYSTEM_PROMPT } from "../../lib/prompts";
import { Transaction } from "./Transaction";
import PerformBorrow from "./PerformBorrow";
import { useAccount } from "wagmi";
import { AgenticBridge } from "./AgenticBridge";

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

// Render tool result based on tool name
const ToolResultRenderer = ({ toolResult }: { toolResult: ToolResult }) => {
  if (toolResult.toolName === "getGnosisPoolsYield") {
    return <GnosisYieldTable yieldData={toolResult.result} />;
  } else if (toolResult.toolName === "getGnosisSafeBalances") {
    return <SafeBalancesCard data={toolResult.result} />;
  } else if (toolResult.toolName === "sendTransaction") {
    return (
      <Transaction
        to={toolResult.result.to}
        value={toolResult.result.value}
        contractAddress={toolResult.result.contractAddress}
        decimals={toolResult.result.decimals}
      />
    );
  } else if (toolResult.toolName === "performBorrow") {
    return (
      <PerformBorrow
        assetToSupply={toolResult.result.assetToSupply}
        assetToBorrow={toolResult.result.assetToBorrow}
        supplyAmount={toolResult.result.supplyAmount}
        borrowAmount={toolResult.result.borrowAmount}
      />
    );
  } else if (toolResult.toolName === "sendBridgeRequest") {
    return (
      <AgenticBridge
        fromChainId={toolResult.result.fromChainId}
        toChainId={toolResult.result.toChainId}
        fromTokenAddress={toolResult.result.fromTokenAddress}
        toTokenAddress={toolResult.result.toTokenAddress}
        fromAmount={toolResult.result.fromAmount}
        fromAddress={toolResult.result.fromAddress}
        toAddress={toolResult.result.toAddress}
        decimals={toolResult.result.decimals}
      />
    );
  } else if (toolResult.toolName === "getYieldStrategies") {
    return null;
  } else if (toolResult.toolName === "getGnosisPoolsYield") {
    return null;
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

export const AIChat = ({
  safeAddress,
  chainId,
}: {
  safeAddress: string;
  chainId: number;
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-prompt",
      role: "system",
      content:
        SYSTEM_PROMPT +
        `\n\n The user vault address is ${safeAddress}. 
        The chain ID is ${chainId}.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log("chainId", chainId);
  console.log("safeAddress", safeAddress);

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
    <Flex
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100dvh - 180px)",
      }}
    >
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
              const lastToolResult =
                message.toolResults?.[message.toolResults.length - 1];

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
                    {!isUser && lastToolResult && (
                      <div
                        style={{
                          marginTop: 8,
                          borderRadius: 8,
                        }}
                      >
                        <ToolResultRenderer
                          key={lastToolResult.toolCallId}
                          toolResult={lastToolResult}
                        />
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
    </Flex>
  );
};
