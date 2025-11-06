import { GoogleGenAI, Chat } from "@google/genai";
import { VibeEntry } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Manages a chat session with Gemini, preserving conversation history.
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

/**
 * Scaffolds a project structure based on a user prompt.
 */
export const scaffoldProject = async (prompt: string): Promise<VibeEntry[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `You are an expert software architect. Based on the following user request, generate a project structure with files and folders.

Output ONLY a valid JSON array of objects with this exact structure:
[
  {
    "id": "path/to/file.js",
    "name": "file.js",
    "content": "// File content here",
    "language": "javascript",
    "type": "file"
  },
  {
    "id": "path/to/folder",
    "name": "folder",
    "content": "",
    "language": "",
    "type": "folder"
  }
]

Rules:
- For folders, id should be the full path (e.g., "src/components")
- For files, id should be the full path including filename (e.g., "src/components/Button.js")
- Include actual working code in the content field
- Set language to the file extension (js, jsx, ts, tsx, css, html, etc.)
- Create folders before files that go in them
- Output ONLY the JSON array, no additional text or formatting

User request: ${prompt}`,
    config: {
      thinkingConfig: { thinkingBudget: 16384 },
    },
  });

  try {
    // Extract JSON from response
    const text = response.text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    const entries: VibeEntry[] = JSON.parse(jsonMatch[0]);
    return entries;
  } catch (error) {
    console.error('Failed to parse scaffold response:', error);
    throw new Error('Failed to generate project structure. Please try again.');
  }
};
