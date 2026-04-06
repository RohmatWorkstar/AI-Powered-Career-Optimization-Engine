import { NextRequest, NextResponse } from "next/server";
import { analyzeWithAI } from "@/lib/ai";
import pdf from "pdf-parse";
import mammoth from "mammoth";

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

/**
 * Extracts raw text from uploaded file (PDF, DOCX, or Plain Text).
 */
async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      const data = await pdf(buffer);
      return data.text.slice(0, 10000);
    } 
    
    if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      fileName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.slice(0, 10000);
    }

    // Treat all other uploads as plain text
    const text = new TextDecoder("utf-8").decode(buffer);
    return text.slice(0, 10000); 
  } catch (error) {
    console.error("[extractTextFromFile] Error:", error);
    // Fallback to basic decoding if library fails
    return new TextDecoder("utf-8").decode(buffer).slice(0, 5000);
  }
}
