import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai";

const SYSTEM_PROMPT = `You are an expert academic productivity coach. Create an optimized daily study schedule for a student.

Consider:
- Energy levels (high focus tasks in peak hours: 9-11 AM, 3-5 PM)
- Pomodoro technique (25 min work, 5 min break, 15 min long break after 4 sessions)
- Deadline priority (closer deadlines get more time)
- Variety (mix subjects to prevent burnout)
- Realistic timing with meals and transitions

Your response MUST be valid JSON with this exact structure:
{
  "schedule": [
    {
      "time": "9:00 AM",
      "duration": "25 min",
      "task": "Task name",
      "subject": "Subject name",
      "type": "work|break|meal",
      "priority": "high|medium|low",
      "tip": "Short productivity tip for this block"
    }
  ],
  "summary": "Brief overview of the schedule strategy",
  "totalStudyTime": "X hours Y minutes",
  "breakCount": 4
}

Return ONLY the JSON object, no other text.`;

export async function POST(request: Request) {
  try {
    const { tasks, studyHours, preferences } = await request.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "Tasks array is required" }, { status: 400 });
    }

    const userContent = `
Student's study schedule request:
- Available study hours: ${studyHours || "9 AM to 9 PM"}
- Preferences: ${preferences || "Standard Pomodoro schedule"}
- Tasks and deadlines:
${tasks.map((t: { subject: string; task: string; deadline: string; priority: string }) => `  * ${t.subject}: ${t.task} (Due: ${t.deadline}, Priority: ${t.priority})`).join("\n")}

Generate an optimized full-day study schedule.`;

    const aiResponse = await callAI(SYSTEM_PROMPT, userContent);

    let parsed;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = {
        schedule: tasks.map((t: { subject: string; task: string }, i: number) => ({
          time: `${9 + i * 1}:00 AM`,
          duration: "25 min",
          task: t.task,
          subject: t.subject,
          type: "work",
          priority: "medium",
          tip: "Stay focused!",
        })),
        summary: "Custom schedule based on your tasks",
        totalStudyTime: `${tasks.length * 25} minutes`,
        breakCount: Math.floor(tasks.length / 2),
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      { error: "Failed to generate schedule. Please check your AI API key." },
      { status: 500 }
    );
  }
}
