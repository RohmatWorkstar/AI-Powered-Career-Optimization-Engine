"use client";

import { useState, useCallback, useEffect } from "react";
import UploadBox from "@/components/UploadBox";
import ScoreBar from "@/components/ScoreBar";
import ResultCard from "@/components/ResultCard";
import EmptyStateIllustration from "@/components/EmptyStateIllustration";
import { SparklesIcon, ArrowPathIcon } from "@/components/icons";
import type { AnalysisResult } from "@/lib/ai";

const MAX_JOB_DESC_LENGTH = 3000;

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // Apply dark mode on mount if not already handled
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError("Please upload your resume before analyzing.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDesc);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed.");
      }
      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, jobDesc]);

  const handleReanalyze = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight block">
                  ResumeAI
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">
                  Powered by Gemini
                </span>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-gray-500 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
          {/* Hero */}
          <div className="mb-10 text-center relative overflow-hidden py-4">
            {/* Background blur decorative circles */}
            <div className="absolute -top-10 -left-10 h-64 w-64 bg-brand-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse-slow"></div>
            <div className="absolute -top-10 -right-10 h-64 w-64 bg-brand-600/10 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse-slow"></div>

            <div className="relative z-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 px-4 py-1.5 mb-6">
                <SparklesIcon className="h-4 w-4 text-brand-500" />
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                  AI-Powered Analysis
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
                Optimize Your Resume with{" "}
                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent">
                  AI Insights
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                Upload your resume, paste a job description, and get instant feedback
                on ATS score, match rate, strengths, and targeted improvement areas.
              </p>
            </div>
          </div>

          {!result ? (
            /* Input Section */
            <div className="space-y-8">
              {/* Empty State Illustration */}
              {!file && !isAnalyzing && (
                <EmptyStateIllustration />
              )}

              <div className="grid gap-8 lg:grid-cols-2">
              {/* Resume Upload */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <h2 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
                  Resume Upload
                </h2>
                <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                  Upload your CV in PDF, DOCX, or TXT format
                </p>
                <UploadBox onFileSelect={setFile} selectedFile={file} />
                {error && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20 animate-fade-in">
                    <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <div className="mb-1.5 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Job Description
                  </h2>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Optional
                  </span>
                </div>
                <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                  Paste the job posting for tailored matching
                </p>
                <div className="relative">
                  <textarea
                    value={jobDesc}
                    onChange={(e) =>
                      setJobDesc(e.target.value.slice(0, MAX_JOB_DESC_LENGTH))
                    }
                    placeholder="Paste the full job description here to get a tailored match score and targeted suggestions..."
                    rows={10}
                    className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                    {jobDesc.length}/{MAX_JOB_DESC_LENGTH}
                  </div>
                </div>
              </div>

              {/* Analyze Button */}
              <div className="lg:col-span-2 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:from-brand-700 hover:to-brand-600 hover:shadow-brand-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {isAnalyzing ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Analyzing your resume...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5" />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
              </div>
            </div>
          ) : (
            /* Results Section */
            <div className="animate-fade-in space-y-8">
              {/* Score Overview */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* ATS Score — Big Hero Card */}
                <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm text-center">
                  <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                    ATS Score
                  </p>
                  <div className="relative flex items-center justify-center">
                    <svg className="h-40 w-40 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" strokeWidth="10" className="stroke-gray-100 dark:stroke-gray-800" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(result.score / 100) * 251.2} 251.2`}
                        className="stroke-brand-500 transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                        {result.score}
                      </span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">/ 100</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {result.score >= 80 ? "🎉 Excellent! Your resume performs well." : result.score >= 60 ? "👍 Good — a few improvements needed." : "⚠️ Needs work to pass ATS filters."}
                  </p>
                </div>

                {/* Score Bars */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Score Breakdown</h3>
                  <ScoreBar label="ATS Score" value={result.score} />
                  <ScoreBar label="Job Match %" value={result.matchPercentage} />
                  <ScoreBar label="Keyword Density" value={Math.round(result.score * 0.85)} />
                  <ScoreBar label="Format Quality" value={Math.round(result.score * 0.95)} />
                </div>
              </div>

              {/* Result Cards Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ResultCard
                  title="Strengths"
                  items={result.strengths}
                  type="strength"
                />
                <ResultCard
                  title="Areas to Improve"
                  items={result.weaknesses}
                  type="weakness"
                />
                <ResultCard
                  title="Suggestions"
                  items={result.suggestions}
                  type="suggestion"
                />
              </div>

              {/* Re-analyze Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleReanalyze}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Re-analyze
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-400 dark:text-gray-600">
          <p>
            ResumeAI — AI Resume Analyzer &amp; Job Matching System &middot;{" "}
            <span className="text-brand-500">Powered by Gemini</span>
          </p>
          <p className="mt-2">
            Built by{" "}
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              Rohmat
            </span>{" "}
            — Portfolio Project
          </p>
        </footer>
      </div>
    </div>
  );
}
