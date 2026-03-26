import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai";

const SYSTEM_PROMPT = `You are an empathetic, motivating AI study coach for college students. Your name is Aria.

Your role:
- Provide SHORT, encouraging responses (2-4 sentences max)
- Be warm, personal, and genuine — not generic or preachy
- Give specific, actionable advice when asked
- Use emojis sparingly but effectively
- If the student is distracted: acknowledge it, normalize it, give a quick reset technique
- If they need motivation: give genuine, energizing encouragement
- If they ask a study question: give a quick helpful answer
- Match the student's energy and be conversational

Examples of good responses:
- "Distracted? That's totally normal! Try the 2-minute rule: just start for 2 minutes. Once you begin, momentum builds. You've got this 💪"
- "You're doing amazing! Every minute of focus compounds. Your future self will thank you for pushing through right now 🎯"
- "Perfect time for a stretch! Stand up, take 5 deep breaths, and come back fresh. Movement resets your focus circuit 🧠"`;

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userContent = context
      ? `[Session context: ${context}]\n\nStudent says: "${message}"`
      : `Student says: "${message}"`;

    const response = await callAI(SYSTEM_PROMPT, userContent);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    // Return a fallback motivational message
    return NextResponse.json({
      response:
        "You're doing great! Keep pushing through — every focused minute brings you closer to your goals. 💪 Stay consistent!",
    });
  }
}
