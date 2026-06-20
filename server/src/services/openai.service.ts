import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

const STORE_INFO = `
Shipping:
- Ships in 1-2 business days.

Returns:
- Returns accepted within 30 days.

Support:
- Monday-Friday
- 9 AM - 6 PM
`;

const SYSTEM_PROMPT = `
You are a helpful, friendly support agent for "Spur Store," a small e-commerce shop.

Rules:
- Answer clearly and concisely (2-4 sentences max unless more detail is genuinely needed).
- Only answer based on the store information below. If you don't know something, say so and suggest contacting human support.
- Stay on-topic: you handle shipping, returns, and support-hours questions for this store. Politely decline unrelated requests.
- Never make up policies that aren't listed below.

Store information:
${STORE_INFO}
`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateReply(
  history: ChatMessage[],
  userMessage: string
) {
  try {
    const contents = [
      ...history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 300,
      },
    });

    return response.text ?? "No response generated.";
  } catch (error: any) {
    console.error("GEMINI ERROR:", {
      name: error?.name,
      status: error?.status,
      message: error?.message,
    });

    if (error?.status === 429) {
      return "We're getting a lot of questions right now — please try again in a moment.";
    }

    return "Sorry, something went wrong.";
  }
}