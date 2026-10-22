import OpenAI from "openai";
import type { ResponseInputItem } from "openai/resources/responses/responses";
import { Message } from "../messages/messages";

const MODEL = "gpt-6-luna";

const toResponseInput = (messages: Message[]): ResponseInputItem[] => messages;

export async function getChatResponse(messages: Message[], apiKey: string) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const response = await openai.responses.create({
    model: MODEL,
    input: toResponseInput(messages),
    max_output_tokens: 200,
    reasoning: { effort: "none" },
    store: false,
  });

  return { message: response.output_text || "エラーが発生しました" };
}

export async function getChatResponseStream(
  messages: Message[],
  apiKey: string
) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const responseStream = await openai.responses.create({
    model: MODEL,
    input: toResponseInput(messages),
    max_output_tokens: 200,
    reasoning: { effort: "none" },
    store: false,
    stream: true,
  });

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const event of responseStream) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(event.delta);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
