import { GoogleGenAI } from "@google/genai";

export interface TranslatedContent {
  en: string[];
  id: string[];
}

export interface AnalysisResult {
  score: number;
  matchPercentage: number;
  strengths: TranslatedContent;
  weaknesses: TranslatedContent;
  suggestions: TranslatedContent;
}

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

/**
 * Build the prompt for Gemini to analyze a resume against a job description.
 * Instructs the AI to return translated content for both English and Indonesian.
 */
function buildPrompt(resumeText: string, jobDesc: string): string {
  return `You are an expert career advisor and ATS (Applicant Tracking System) specialist.

Analyze the following resume${jobDesc ? " against the given job description" : ""} and provide a detailed evaluation.

=== RESUME ===
${resumeText}
${jobDesc ? `\n=== JOB DESCRIPTION ===\n${jobDesc}` : ""}

Respond ONLY with a valid JSON object in this exact format (no markdown, no code fences, no extra text). For the arrays (strengths, weaknesses, suggestions), you MUST provide BOTH an English ("en") array and an Indonesian ("id") array containing equivalent translated points.

{
  "score": <number 0-100 representing ATS compatibility score>,
  "matchPercentage": <number 0-100 representing job match percentage>,
  "strengths": {
    "en": [<array of 3-5 specific strength strings found in the resume in English>],
    "id": [<array of 3-5 specific strength strings found in the resume in Indonesian>]
  },
  "weaknesses": {
    "en": [<array of 2-4 specific weakness/gap strings in English>],
    "id": [<array of 2-4 specific weakness/gap strings in Indonesian>]
  },
  "suggestions": {
    "en": [<array of 3-5 actionable improvement suggestions in English>],
    "id": [<array of 3-5 actionable improvement suggestions in Indonesian>]
  }
}

Be specific and reference actual content from the resume. Do not use generic feedback. Make sure the translated content means exactly the same thing.`;
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

    const safeArray = (arr: any) => (Array.isArray(arr) ? arr.map(String) : []);
    const safeContent = (obj: any): TranslatedContent => ({
      en: obj && obj.en ? safeArray(obj.en) : [],
      id: obj && obj.id ? safeArray(obj.id) : [],
    });

    // Validate and clamp values
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      matchPercentage: Math.max(0, Math.min(100, Number(parsed.matchPercentage) || 0)),
      strengths: safeContent(parsed.strengths),
      weaknesses: safeContent(parsed.weaknesses),
      suggestions: safeContent(parsed.suggestions),
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

    const textContent = response.text;
    
    if (!textContent) {
      throw new Error("No text content returned from AI. Please try again.");
    }

    return parseGeminiResponse(textContent);
  } catch (error: any) {
    console.error("[analyzeWithAI] Failure:", error);
    
    const message = error?.message || "";
    
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
    strengths: {
      en: [
        "Strong React & Next.js skills",
        "Solid project portfolio",
        "Clear and concise communication style",
        "Experience with TypeScript",
      ],
      id: [
        "Keahlian React & Next.js yang kuat",
        "Portofolio proyek yang solid",
        "Gaya komunikasi yang jelas dan ringkas",
        "Berpengalaman dengan TypeScript",
      ]
    },
    weaknesses: {
      en: [
        "Limited automated testing experience",
        "No cloud deployment mentioned",
        "Missing quantified achievements",
      ],
      id: [
        "Pengalaman pengujian otomatis yang terbatas",
        "Tidak ada penyebutan cloud deployment",
        "Pencapaian tidak diukur secara kuantitatif",
      ]
    },
    suggestions: {
      en: [
        "Add unit/integration tests using Jest or Vitest",
        "Highlight backend API projects with Node.js or Python",
        "Include measurable outcomes (e.g., 'reduced load time by 30%')",
        "Mention cloud platforms like AWS, GCP, or Vercel deployments",
      ],
      id: [
        "Tambahkan unit/integration tests menggunakan Jest atau Vitest",
        "Soroti proyek backend API menggunakan Node.js atau Python",
        "Sertakan hasil yang terukur (misal., 'mengurangi waktu muat sebesar 30%')",
        "Sebutkan platform cloud seperti AWS, GCP, atau deployment Vercel",
      ]
    },
  };
}
