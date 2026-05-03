import { NextRequest, NextResponse } from "next/server";
import { analyzeWithAI } from "@/lib/ai";
import { extractTextFromFile } from "@/lib/fileUtils";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const jobDesc = (formData.get("jobDescription") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "Resume file is required." },
        { status: 400 }
      );
    }

    // Extract text from the uploaded file
    // For now we read the raw text content — PDF/DOCX parsing can be added later
    const resumeText = await extractTextFromFile(file);

    const result = await analyzeWithAI(resumeText, jobDesc);

    return NextResponse.json({ ...result, resumeText });
  } catch (error) {
    console.error("[/api/analyze] Error:", error);
    const message =
      error instanceof Error ? error.message : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

