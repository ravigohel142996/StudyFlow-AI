import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai";

const SYSTEM_PROMPT = `You are an expert teacher and academic tutor. Summarize the provided lecture content for a college student.

Your response MUST be valid JSON with this exact structure:
{
  "summary": "A concise summary in 150-200 words",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "flashcards": [
    {"question": "Q1?", "answer": "A1"},
    {"question": "Q2?", "answer": "A2"},
    {"question": "Q3?", "answer": "A3"},
    {"question": "Q4?", "answer": "A4"},
    {"question": "Q5?", "answer": "A5"}
  ]
}

Provide:
1. A concise summary (150-200 words) that captures the main concepts
2. 5-8 key bullet points highlighting the most important takeaways
3. Exactly 5 quiz flashcards with a clear question and a comprehensive answer

Return ONLY the JSON object, no other text.`;

export async function POST(request: Request) {
  try {
    const { content, title } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const truncated = content.slice(0, 8000);
    const aiResponse = await callAI(SYSTEM_PROMPT, truncated);

    // Parse the JSON response
    let parsed;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback if AI doesn't return valid JSON
      parsed = {
        summary: aiResponse.slice(0, 500),
        keyPoints: ["Review the content manually", "Key points not parsed"],
        flashcards: [
          { question: "What is the main topic?", answer: "See the summary above" },
        ],
      };
    }

    return NextResponse.json({
      title: title || "Untitled Summary",
      summary: parsed.summary || "",
      keyPoints: parsed.keyPoints || [],
      flashcards: parsed.flashcards || [],
    });
  } catch (error) {
    console.error("Summarize API error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary. Please check your AI API key." },
      { status: 500 }
    );
  }
}
