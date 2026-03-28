import { GoogleGenAI } from "@google/genai";

export interface AnalysisResult {
  score: number;
  matchPercentage: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

/**
 * Build the prompt for Gemini to analyze a resume against a job description.
 */
function buildPrompt(resumeText: string, jobDesc: string): string {
  return `You are an expert career advisor and ATS (Applicant Tracking System) specialist.

Analyze the following resume${jobDesc ? " against the given job description" : ""} and provide a detailed evaluation.

=== RESUME ===
${resumeText}
${jobDesc ? `\n=== JOB DESCRIPTION ===\n${jobDesc}` : ""}

Respond ONLY with a valid JSON object in this exact format (no markdown, no code fences, no extra text):
{
  "score": <number 0-100 representing ATS compatibility score>,
  "matchPercentage": <number 0-100 representing job match percentage>,
  "strengths": [<array of 3-5 specific strength strings found in the resume>],
  "weaknesses": [<array of 2-4 specific weakness/gap strings>],
  "suggestions": [<array of 3-5 actionable improvement suggestions>]
}

Be specific and reference actual content from the resume. Do not use generic feedback.`;
}

/**
 * Parse the Gemini API response text into an AnalysisResult.
 */
function parseGeminiResponse(text: string): AnalysisResult {
  // Remove markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  try {
    const parsed = JSON.parse(cleaned);

    // Validate and clamp values
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      matchPercentage: Math.max(0, Math.min(100, Number(parsed.matchPercentage) || 0)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
    };
  } catch (error) {
    console.error("[parseGeminiResponse] Failed to parse JSON:", text);
    throw new Error("Failed to parse AI response. The model did not return valid JSON.");
  }
}

/**
 * Analyzes a resume against a job description using Google GenAI SDK.
 */
export async function analyzeWithAI(
  resumeText: string,
  jobDesc: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Running in mock mode.");
    return getMockResult();
  }

  try {
    const prompt = buildPrompt(resumeText, jobDesc);

    // Following the official quickstart model name: gemini-3-flash-preview
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // The SDK response structure usually has 'text' property or requires awaiting it
    const textContent = response.text;
    
    if (!textContent) {
      throw new Error("No text content returned from AI. Please try again.");
    }

    return parseGeminiResponse(textContent);
  } catch (error: any) {
    console.error("[analyzeWithAI] Failure:", error);
    
    const message = error?.message || "";
    
    // Specifically handle 429 (Rate Limit) and other common errors
    if (message.includes("429") || message.includes("quota") || message.includes("exhausted")) {
      throw new Error("AI analysis limit reached (Free Tier). Please wait a moment before trying again or come back later.");
    }
    
    if (message.includes("404") || message.includes("not found")) {
      throw new Error("The AI model is currently unavailable in your region. Please try again later.");
    }

    if (message.includes("API key")) {
      throw new Error("Invalid API configuration. Please check the project setup.");
    }

    throw new Error(
      "AI analysis is temporarily unavailable. Please try again in a few moments."
    );
  }
}

/**
 * Returns mock data as fallback when API key is not available.
 */
function getMockResult(): AnalysisResult {
  return {
    score: 85,
    matchPercentage: 78,
    strengths: [
      "Strong React & Next.js skills",
      "Solid project portfolio",
      "Clear and concise communication style",
      "Experience with TypeScript",
    ],
    weaknesses: [
      "Limited automated testing experience",
      "No cloud deployment mentioned",
      "Missing quantified achievements",
    ],
    suggestions: [
      "Add unit/integration tests using Jest or Vitest",
      "Highlight backend API projects with Node.js or Python",
      "Include measurable outcomes (e.g., 'reduced load time by 30%')",
      "Mention cloud platforms like AWS, GCP, or Vercel deployments",
    ],
  };
}
