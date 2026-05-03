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

function parseResponse(text: string): AnalysisResult {
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
    console.error("[parseResponse] Failed to parse JSON:", text);
    throw new Error("Failed to parse AI response. The model did not return valid JSON.");
  }
}

/**
 * Analyzes with Gemini API.
 */
async function analyzeWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  // Following the official quickstart model name: gemini-3-flash-preview
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const textContent = response.text;
  
  if (!textContent) {
    throw new Error("No text content returned from Gemini AI.");
  }

  return textContent;
}

/**
 * Analyzes with Grok (or Groq) API.
 */
async function analyzeWithGrok(prompt: string): Promise<string> {
  const apiKey = process.env.GROK_API;
  if (!apiKey) throw new Error("GROK_API is not set.");
  
  // Automatically detect if it's a Groq key (gsk_) or xAI key (xai-)
  const isGroq = apiKey.startsWith('gsk_');
  const apiUrl = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.xai.com/v1/chat/completions";
  const model = isGroq ? "llama-3.3-70b-versatile" : "grok-beta";
  
  const body: any = {
    model: model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2, // Use low temperature for more consistent JSON
  };

  // Groq supports JSON mode for valid output structure
  if (isGroq) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Grok API Error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const textContent = data.choices?.[0]?.message?.content;
  
  if (!textContent) {
    throw new Error("No text content returned from Grok AI.");
  }
  
  return textContent;
}

/**
 * Analyzes a resume against a job description using available AI providers.
 * Falls back to another provider if one fails (limits, timeout, etc).
 */
export async function analyzeWithAI(
  resumeText: string,
  jobDesc: string
): Promise<AnalysisResult> {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasGrok = !!process.env.GROK_API;

  if (!hasGemini && !hasGrok) {
    console.warn("No API keys set. Running in mock mode.");
    return getMockResult();
  }

  const prompt = buildPrompt(resumeText, jobDesc);

  const providers = [];
  
  // Urutan Provider: 
  // 1. Prioritaskan dan coba Groq/Grok terlebih dahulu.
  // 2. Jika limit/timeout, akan fallback ke Gemini (vice-versa dari urutan aslinya).
  if (hasGrok) providers.push({ name: 'Grok', fn: analyzeWithGrok });
  if (hasGemini) providers.push({ name: 'Gemini', fn: analyzeWithGemini });

  let lastError: any = null;

  for (const provider of providers) {
    try {
      console.log(`[analyzeWithAI] Attempting analysis with ${provider.name}...`);
      const textContent = await provider.fn(prompt);
      return parseResponse(textContent);
    } catch (error: any) {
      console.error(`[analyzeWithAI] ${provider.name} provider failed:`, error?.message || error);
      lastError = error;
      // Continue to the next provider in the fallback chain
    }
  }

  // If all providers fail, inspect the last error to throw an appropriate message
  const message = lastError?.message || "";
  
  if (message.includes("429") || message.includes("quota") || message.includes("exhausted")) {
    throw new Error("AI analysis limit reached for all providers. Please wait a moment before trying again or come back later.");
  }
  
  if (message.includes("404") || message.includes("not found")) {
    throw new Error("The AI model is currently unavailable. Please try again later.");
  }

  if (message.includes("API key") || message.includes("401")) {
    throw new Error("Invalid API configuration. Please check the project setup.");
  }

  throw new Error("AI analysis is temporarily unavailable. Please try again in a few moments.");
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

/**
 * Build prompt for resume improvement.
 */
function buildImprovePrompt(resumeText: string, weaknesses: string[], suggestions: string[]): string {
  return `You are an expert resume writer and career advisor. Your task is to improve the following resume based on the analysis feedback provided.

=== ORIGINAL RESUME ===
${resumeText}

=== IDENTIFIED WEAKNESSES ===
${weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

=== SUGGESTED IMPROVEMENTS ===
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Instructions:
1. Rewrite and improve the resume text to address the weaknesses and incorporate the suggestions
2. Keep ALL original factual information (names, dates, companies, education) exactly as they are
3. Improve the wording, structure, and impact of bullet points
4. Add quantified achievements where appropriate (using realistic estimates based on context)
5. Optimize for ATS (Applicant Tracking Systems) by using relevant keywords
6. Use strong action verbs at the beginning of each bullet point
7. Ensure consistent formatting throughout
8. Keep the resume concise and professional

Return ONLY the improved resume text. Do not include any explanations, comments, or markdown formatting. Just return the clean, improved resume text ready to be used.`;
}

/**
 * Improves a resume using AI based on analysis feedback.
 * Uses the same failover strategy as analyzeWithAI.
 */
export async function improveResumeWithAI(
  resumeText: string,
  weaknesses: string[],
  suggestions: string[]
): Promise<string> {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasGrok = !!process.env.GROK_API;

  if (!hasGemini && !hasGrok) {
    // Return a mock improved resume for demo
    return getMockImprovedResume(resumeText);
  }

  const prompt = buildImprovePrompt(resumeText, weaknesses, suggestions);

  const providers = [];
  if (hasGrok) providers.push({ name: 'Grok', fn: analyzeWithGrok });
  if (hasGemini) providers.push({ name: 'Gemini', fn: analyzeWithGemini });

  let lastError: any = null;

  for (const provider of providers) {
    try {
      console.log(`[improveResumeWithAI] Attempting improvement with ${provider.name}...`);
      const result = await provider.fn(prompt);
      // Clean up any markdown code fences if present
      let cleaned = result.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:\w+)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      return cleaned;
    } catch (error: any) {
      console.error(`[improveResumeWithAI] ${provider.name} provider failed:`, error?.message || error);
      lastError = error;
    }
  }

  throw new Error("Failed to improve resume. Please try again later.");
}

/**
 * Returns a mock improved resume for demo/fallback.
 */
function getMockImprovedResume(originalText: string): string {
  return `${originalText}

---
[AI Improvement Notes]
• Enhanced action verbs and quantified achievements
• Optimized keyword density for ATS compatibility
• Improved formatting and structure for better readability
• Added measurable outcomes to project descriptions`;
}

/**
 * Build prompt for resume tailoring based on job description.
 */
function buildTailorPrompt(resumeText: string, jobDesc: string, locale: string): string {
  const langInstruction = locale === 'id' 
    ? 'Write the tailored resume entirely in Indonesian language (Bahasa Indonesia).' 
    : 'Write the tailored resume entirely in English language.';

  return `You are an expert resume writer and career advisor. Your task is to tailor the following resume specifically to match the given job description.

=== ORIGINAL RESUME ===
${resumeText}

=== TARGET JOB DESCRIPTION ===
${jobDesc}

Instructions:
1. Rewrite the resume to heavily emphasize the skills and experiences that match the job description.
2. Incorporate keywords from the job description naturally to ensure it passes ATS (Applicant Tracking Systems).
3. Keep ALL factual information (names, dates, companies, education) accurate. Do not invent fake experience, but you may reframe existing experience to sound more relevant.
4. Improve bullet points using strong action verbs and quantified achievements.
5. Format it cleanly as a professional resume.
6. Make it compelling to HR recruiters reading the target job description.
7. CRITICAL: ${langInstruction}
8. KEYWORD MARKING (CRITICAL): Wrap any significant keyword or key phrase from the job description that you incorporated into the resume using double angle brackets like this: <<keyword>>. This includes: specific tools, technologies, frameworks, certifications, methodologies, and important role-specific skills. Only mark truly significant terms from the JD — do NOT mark common words or generic phrases. Example: "Developed <<microservices>> architecture using <<Node.js>> and <<Docker>>".

Return ONLY the tailored resume text (with <<keyword>> markers). Do not include any explanations, comments, or extra markdown formatting.`;
}


/**
 * Tailors a resume specifically to a job description using AI.
 */
export async function tailorResumeWithAI(
  resumeText: string,
  jobDesc: string,
  locale: string = 'en'
): Promise<string> {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasGrok = !!process.env.GROK_API;

  if (!hasGemini && !hasGrok) {
    return getMockImprovedResume(resumeText);
  }

  const prompt = buildTailorPrompt(resumeText, jobDesc, locale);

  const providers = [];
  if (hasGrok) providers.push({ name: 'Grok', fn: analyzeWithGrok });
  if (hasGemini) providers.push({ name: 'Gemini', fn: analyzeWithGemini });

  let lastError: any = null;

  for (const provider of providers) {
    try {
      console.log(`[tailorResumeWithAI] Attempting tailoring with ${provider.name}...`);
      const result = await provider.fn(prompt);
      let cleaned = result.trim();
      if (cleaned.startsWith("\`\`\`")) {
        cleaned = cleaned.replace(/^\`\`\`(?:\w+)?\s*\n?/, "").replace(/\n?\`\`\`\s*$/, "");
      }
      return cleaned;
    } catch (error: any) {
      console.error(`[tailorResumeWithAI] ${provider.name} provider failed:`, error?.message || error);
      lastError = error;
    }
  }

  throw new Error("Failed to tailor resume. Please try again later.");
}

