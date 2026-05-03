import { NextRequest, NextResponse } from "next/server";
import { tailorResumeWithAI } from "@/lib/ai";
import { extractTextFromFile } from "@/lib/fileUtils";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File | null;
    const jdFile = formData.get("jdFile") as File | null;
    const jdText = formData.get("jdText") as string | null;
    const locale = (formData.get("locale") as string) || "en";

    if (!resumeFile) {
      return NextResponse.json(
        { error: "Resume file is required." },
        { status: 400 }
      );
    }

    if (!jdFile && !jdText) {
      return NextResponse.json(
        { error: "Job Description is required." },
        { status: 400 }
      );
    }

    // Extract text from the uploaded resume file
    const resumeText = await extractTextFromFile(resumeFile);
    
    // Extract text from JD file if present, otherwise use provided text
    let jobDescText = jdText || "";
    if (jdFile) {
      jobDescText = await extractTextFromFile(jdFile);
    }

    const tailoredResume = await tailorResumeWithAI(resumeText, jobDescText, locale);

    return NextResponse.json({ tailoredResume, originalResumeText: resumeText });
  } catch (error) {
    console.error("[/api/job-matcher] Error:", error);
    const message =
      error instanceof Error ? error.message : "Job matching failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
