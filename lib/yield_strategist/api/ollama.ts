import ollama from "ollama";

import {
  getGnosisYield,
  getGnosisYieldTool,
} from "@/lib/yield_strategist/ollama/tools";

const model = "0xroyce/Plutus-3B";
// const model = "qwen3:8b";

const availableFunctions = {
  getGnosisYield: getGnosisYield,
};

const availableTools = [getGnosisYieldTool];

// todo: maybe impl ollamaChatWithTools

export async function ollamaChat(messages) {
  const response = await ollama.chat({
    model: model,
    messages: messages,
    tools: availableTools,
  });

  let output;
  let finalResponse;

  if (response.message.tool_calls) {
    // Process tool calls from the response
    for (const tool of response.message.tool_calls) {
      const functionToCall = availableFunctions[tool.function.name];
      if (functionToCall) {
        console.log("Calling function:", tool.function.name);
        console.log("Arguments:", tool.function.arguments);
        output = functionToCall(tool.function.arguments);
        console.log("Function output:", output);

        // Add the function response to messages for the model to use
        console.log(response);
        messages.push(response.message);
        messages.push({
          role: "tool",
          content: output.toString(),
        });
      } else {
        console.log("Function", tool.function.name, "not found");
      }
    }

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
