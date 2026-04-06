import { NextRequest, NextResponse } from "next/server";
import { improveResumeWithAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, weaknesses, suggestions } = body;

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }

    const improvedText = await improveResumeWithAI(
      resumeText,
      weaknesses || [],
      suggestions || []
    );

    return NextResponse.json({ improvedText });
  } catch (error) {
    console.error("[/api/improve] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to improve resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
