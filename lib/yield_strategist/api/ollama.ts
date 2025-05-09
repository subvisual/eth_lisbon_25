import ollama, { Message } from "ollama";

import { toolbelt } from "@/lib/yield_strategist/ollama/tools";

const model = "0xroyce/Plutus-3B";
// const model = "qwen3:8b";

// todo: maybe impl ollamaChatWithTools
export async function ollamaChat(messages: Message[]) {
  const response = await ollama.chat({
    model: model,
    messages: messages,
    tools: toolbelt.tools,
  });

  let output;
  let finalResponse;

  if (response.message.tool_calls) {
    // Process tool calls from the response
    for (const tool of response.message.tool_calls) {
      const functionToCall = toolbelt.functions[tool.function.name];
      if (functionToCall) {
        console.log("Calling function:", tool.function.name);
        console.log("Arguments:", tool.function.arguments);
        output = await functionToCall(tool.function.arguments);
        console.log("Function output:", output);

        // Add the function response to messages for the model to use
        messages.push(response.message);
        messages.push({
          role: "tool",
          content: JSON.stringify(output, null, 2),
        });
      } else {
        console.log("Function", tool.function.name, "not found");
      }
    }

    // final response takes into account tool output
    // and model reasoning with it
    finalResponse = await ollama.chat({
      model: model,
      messages: messages,
    });
    console.log("Final response:", finalResponse.message.content);
  } else {
    console.log("No tool calls returned from model");
  }

  return finalResponse;
}
