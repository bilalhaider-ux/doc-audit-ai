import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
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

    // Parse the FormData to get the uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Convert the File to a Buffer, then to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Initialize the Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct the prompt for Summary and Risks
    const prompt = `
You are an expert legal and financial document auditor. I have attached a PDF document for you to analyze.
Your task is to analyze the document and provide a structured JSON output containing:
1. "summary": An array of strings, where each string is a concise bullet point summarizing a key aspect of the document (aim for 4-6 key points).
2. "risks": An array of objects, where each object represents a potential risk, unusual clause, missing term, or liability found in the document.
Each risk object must have:
  - "title": A short title for the risk (e.g., "Auto-Renewal Clause").
  - "description": A brief explanation of why this is a risk.
  - "level": The severity level, strictly one of: "High", "Medium", or "Low".

Return ONLY valid JSON. Do not include markdown code blocks like \`\`\`json. Ensure the keys are strictly "summary" and "risks".
`;

    // Send the prompt and the PDF file to Gemini directly
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting from Gemini response
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Parse the JSON
    const parsedData = JSON.parse(text);

    return NextResponse.json({
      summary: parsedData.summary || [],
      risks: parsedData.risks || [],
      // We don't have extractedText anymore since we didn't use pdf-parse. 
      // We can pass a flag so the chat knows to use the file instead, but for simplicity, 
      // we'll pass a small message. The user can't chat with the raw text easily without uploading again,
      // but let's just pass the base64 data back if it's small, or handle it differently.
      // Actually, passing base64 back might be heavy. Let's pass a placeholder.
      extractedText: "PDF_BASE64:" + base64Data 
    });

  } catch (error: any) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during analysis." },
      { status: 500 }
    );
  }
}
