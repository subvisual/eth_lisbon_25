import React, { useState, useRef, useEffect } from "react";
import { Card, Input, Button, List, Typography, Flex, Spin } from "antd";
import ReactMarkdown from "react-markdown";

const { Text } = Typography;

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

// System prompt for financial analysis
const SYSTEM_PROMPT = `As a financial analysis assistant, follow these guidelines when responding to queries:

1. When you receive tool results with analytical data:
   - Present numerical data in well-formatted tables when appropriate
   - Use bullet points for key insights
   - Format percentages, monetary values, and other numerical data consistently
   - Highlight significant changes or outliers in the data

2. For financial analysis:
   - Prioritize the most relevant metrics (APY, TVL, ROI, etc.)
   - Compare values against benchmarks when available
   - Analyze trends and patterns from a professional finance perspective
   - Provide context for the numbers (e.g., "This APY is 2.3% higher than market average")

3. When displaying direct values or answers:
   - Make important numbers stand out using formatting
   - Organize information in a logical hierarchy
   - Be concise and precise with financial terminology

Always analyze from the perspective of an expert financial analyst, focusing on actionable insights rather than just raw data.`;

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-prompt",
      role: "system",
      content: SYSTEM_PROMPT,
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

      if (!response.ok || !response.body) {
        throw new Error(response.statusText || "Failed to get response");
      }

      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk to text
        const chunk = decoder.decode(value);

        // Process all event stream messages in this chunk
        const eventMessages = chunk
          .split("\n\n")
          .filter((msg) => msg.trim().startsWith("data: "));

        for (const eventMessage of eventMessages) {
          if (eventMessage.includes("[DONE]")) continue;

          try {
            // Extract the JSON data
            const json = JSON.parse(eventMessage.replace("data: ", ""));

            // Add to the assistant's message
            if (json.content) {
              assistantResponse += json.content;

              // Update the assistant's message in real-time
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: assistantResponse }
                    : msg
                )
              );
            }
          } catch (error) {
            console.error("Error parsing SSE message:", error);
          }
        }
      }
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
                  <Text strong>{isUser ? "You" : "Assistant"}</Text>
                  <div style={{ whiteSpace: "pre-wrap" }}>
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
