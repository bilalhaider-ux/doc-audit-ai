import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { documentText, message, chatHistory } = body;

    if (!documentText) {
      return NextResponse.json({ error: "No document text provided." }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format chat history for Gemini
    const formattedHistory = chatHistory ? chatHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })) : [];

    let initialParts: any[] = [
      { text: `I am going to provide you with a legal/financial document. Your role is an expert auditor. Please answer any subsequent questions based ONLY on this document. If the answer is not in the document, say so politely. Do not make up information. Here is the document:` }
    ];

    if (documentText.startsWith("PDF_BASE64:")) {
      const base64Data = documentText.replace("PDF_BASE64:", "");
      initialParts.push({
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      });
    } else {
      initialParts.push({ text: `\n\n${documentText.substring(0, 50000)}` });
    }

    // Initialize chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: initialParts,
        },
        {
          role: "model",
          parts: [{ text: "I have read and understood the document. I will act as your expert auditor and answer your questions based only on the provided PDF." }],
        },
        ...formattedHistory
      ],
    });

    // Send the user's new message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      reply: text
    });

  } catch (error: any) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during chat processing." },
      { status: 500 }
    );
  }
}
