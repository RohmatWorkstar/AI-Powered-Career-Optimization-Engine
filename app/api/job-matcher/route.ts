import { NextRequest, NextResponse } from "next/server";
import { tailorResumeWithAI } from "@/lib/ai";
import { extractTextFromFile } from "@/lib/fileUtils";

/**
 * Extract unique keywords from <<keyword>> markers in AI text.
 * Returns { cleanText, keywords }.
 */
function parseKeywords(markedText: string): { cleanText: string; keywords: string[] } {
  const keywordsSet = new Set<string>();
  const markerRegex = /<<([^>>]+)>>/g;
  let match;
  while ((match = markerRegex.exec(markedText)) !== null) {
    keywordsSet.add(match[1].trim());
  }
  // Remove markers from text so it reads cleanly
  const cleanText = markedText.replace(/<<([^>>]+)>>/g, "$1");
  return { cleanText, keywords: Array.from(keywordsSet) };
}

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

    const resumeText = await extractTextFromFile(resumeFile);
    
    let jobDescText = jdText || "";
    if (jdFile) {
      jobDescText = await extractTextFromFile(jdFile);
    }

    const markedResume = await tailorResumeWithAI(resumeText, jobDescText, locale);
    const { cleanText: tailoredResume, keywords } = parseKeywords(markedResume);

    return NextResponse.json({ tailoredResume, keywords, originalResumeText: resumeText });
  } catch (error) {
    console.error("[/api/job-matcher] Error:", error);
    const message =
      error instanceof Error ? error.message : "Job matching failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

