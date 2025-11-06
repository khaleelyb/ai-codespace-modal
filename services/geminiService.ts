
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Manages a chat session with Gemini, preserving conversation history.
 * @param existingChat - An optional existing chat instance.
 * @param message - The user's message.
 * @returns An object containing the updated chat instance and the model's response text.
 */
export const runChat = async (existingChat: Chat | null, message: string): Promise<{chatInstance: Chat, response: string}> => {
  const chat = existingChat || ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are Vibe Bot, a helpful and friendly AI assistant for developers. You are integrated into a code editor called Vibe Code. Be concise and helpful.'
    }
  });

  const response = await chat.sendMessage({ message });
  return { chatInstance: chat, response: response.text };
};

/**
 * Analyzes a code snippet for a quick overview using a fast model.
 * @param code - The code to analyze.
 * @returns A markdown-formatted analysis from the model.
 */
export const analyzeCode = async (code: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `Analyze the following code snippet. Provide a brief, high-level overview of what it does, its purpose, and any potential improvements. Format the response in markdown.

--- CODE ---
${code}
--- END CODE ---
`,
  });
  return response.text;
};

/**
 * Performs complex code refactoring using the Pro model with maximum thinking budget.
 * @param code - The code to refactor.
 * @returns The refactored code block from the model.
 */
export const refactorCodeWithThinking = async (code: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `You are an expert software engineer. Refactor the following code snippet. Your goal is to improve its readability, efficiency, and adherence to best practices. Provide only the refactored code in a single code block, with brief comments explaining the major changes.

--- CODE TO REFACTOR ---
${code}
--- END CODE ---
`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });
  return response.text;
};
