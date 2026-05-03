"use client";

import { useState, useCallback, useEffect } from "react";
import UploadBox from "@/components/UploadBox";
import ScoreBar from "@/components/ScoreBar";
import ResultCard from "@/components/ResultCard";
import EmptyStateIllustration from "@/components/EmptyStateIllustration";
import DownloadReportButton from "@/components/DownloadReportButton";
import ResumeEditor from "@/components/ResumeEditor";
import { SparklesIcon, ArrowPathIcon, PencilSquareIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { AnalysisResult } from "@/lib/ai";

const MAX_JOB_DESC_LENGTH = 3000;

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<{ remainingTime: number } | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [showEditor, setShowEditor] = useState(false);
  const { t, locale } = useLanguage();

  // Check limits on mount
  useEffect(() => {
    const cooldownEnd = parseInt(localStorage.getItem("demo_cooldown_end") || "0", 10);
    if (cooldownEnd && Date.now() < cooldownEnd) {
      setLimitInfo({ remainingTime: cooldownEnd - Date.now() });
    }
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (!limitInfo) return;
    
    const interval = setInterval(() => {
      const cooldownEnd = parseInt(localStorage.getItem("demo_cooldown_end") || "0", 10);
      const remaining = cooldownEnd - Date.now();
      
      if (remaining <= 0) {
        setLimitInfo(null);
        localStorage.setItem("demo_usage_count", "0");
        localStorage.removeItem("demo_cooldown_end");
        clearInterval(interval);
      } else {
        setLimitInfo({ remainingTime: remaining });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [limitInfo]);

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError(t.errorUploadResume);
      return;
    }

    let usageCount = parseInt(localStorage.getItem("demo_usage_count") || "0", 10);
    let cooldownEnd = parseInt(localStorage.getItem("demo_cooldown_end") || "0", 10);

    // Limit checks
    if (cooldownEnd && Date.now() < cooldownEnd) {
      setLimitInfo({ remainingTime: cooldownEnd - Date.now() });
      return;
    } else if (cooldownEnd && Date.now() >= cooldownEnd) {
      usageCount = 0;
      localStorage.setItem("demo_usage_count", "0");
      localStorage.removeItem("demo_cooldown_end");
    }

    if (usageCount >= 3) {
      cooldownEnd = Date.now() + 30 * 60 * 1000;
      localStorage.setItem("demo_cooldown_end", cooldownEnd.toString());
      setLimitInfo({ remainingTime: 30 * 60 * 1000 });
      return;
    }

    setLimitInfo(null);
    setError(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDesc);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t.errorAnalysisFailed);
      }
      const data = await res.json();
      const { resumeText: extractedText, ...analysisResult } = data;
      setResult(analysisResult as AnalysisResult);
      setResumeText(extractedText || "");

      // Increment usage count on success
      usageCount += 1;
      localStorage.setItem("demo_usage_count", usageCount.toString());
      if (usageCount >= 3) {
        localStorage.setItem("demo_cooldown_end", (Date.now() + 30 * 60 * 1000).toString());
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorSomethingWrong);
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, jobDesc, t]);

  const handleReanalyze = () => {
    setResult(null);
    setError(null);
    setResumeText("");
    setShowEditor(false);
  };

  return (
    <>
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
                  {t.badge}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
                {t.heroTitle}
                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent">
                  {t.heroTitleHighlight}
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                {t.heroDescription}
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
                  {t.resumeUpload}
                </h2>
                <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                  {t.resumeUploadDesc}
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
                    {t.jobDescription}
                  </h2>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {t.optional}
                  </span>
                </div>
                <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                  {t.jobDescriptionDesc}
                </p>
                <div className="relative">
                  <textarea
                    value={jobDesc}
                    onChange={(e) =>
                      setJobDesc(e.target.value.slice(0, MAX_JOB_DESC_LENGTH))
                    }
                    placeholder={t.jobDescriptionPlaceholder}
                    rows={10}
                    className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                    {jobDesc.length}/{MAX_JOB_DESC_LENGTH}
                  </div>
                </div>
              </div>

              {/* Limit reached UI */}
              {limitInfo && (
                <div className="lg:col-span-2 mt-2 animate-fade-in relative overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/40 dark:to-gray-900 p-8 shadow-sm">
                  <div className="absolute -top-10 -right-10 h-32 w-32 bg-brand-500/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2.25m0 0v2.25m0-2.25h2.25m-2.25 0H9.75M12 21a9 9 0 100-18 9 9 0 000 18z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {t.limitReachedTitle}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                        {t.limitReachedMessage}
                      </p>
                      <div className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 shadow-sm border border-brand-100 dark:border-brand-800">
                         <svg className="h-4 w-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                         </svg>
                         {Math.floor(limitInfo.remainingTime / 60000).toString().padStart(2, '0')}:
                         {Math.floor((limitInfo.remainingTime % 60000) / 1000).toString().padStart(2, '0')} {t.timeRemaining}
                      </div>
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 border-t border-brand-100 dark:border-brand-800/50 pt-4">
                        {t.limitCooldownMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              {!limitInfo && (
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
                      {t.analyzing}
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5" />
                      {t.analyzeResume}
                    </>
                  )}
                </button>
              </div>
              )}
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
                    {t.atsScore}
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
                    {result.score >= 80 ? t.scoreExcellent : result.score >= 60 ? t.scoreGood : t.scoreNeedsWork}
                  </p>
                </div>

                {/* Score Bars */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm space-y-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t.scoreBreakdown}</h3>
                  <ScoreBar label={t.atsScore} value={result.score} />
                  <ScoreBar label={t.jobMatch} value={result.matchPercentage} />
                  <ScoreBar label={t.keywordDensity} value={Math.round(result.score * 0.85)} />
                  <ScoreBar label={t.formatQuality} value={Math.round(result.score * 0.95)} />
                </div>
              </div>

              {/* Result Cards Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ResultCard
                  title={t.strengths}
                  items={result.strengths[locale] || []}
                  type="strength"
                />
                <ResultCard
                  title={t.areasToImprove}
                  items={result.weaknesses[locale] || []}
                  type="weakness"
                />
                <ResultCard
                  title={t.suggestions}
                  items={result.suggestions[locale] || []}
                  type="suggestion"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <DownloadReportButton result={result} />
                <button
                  onClick={() => setShowEditor(true)}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-brand-500 dark:border-brand-400 bg-brand-50 dark:bg-brand-950/30 px-5 py-3 text-sm font-semibold text-brand-700 dark:text-brand-300 shadow-sm transition-all hover:bg-brand-100 dark:hover:bg-brand-950/50 hover:shadow-md active:scale-[0.97]"
                >
                  <PencilSquareIcon className="h-4.5 w-4.5" />
                  {t.improveResume}
                </button>
                <button
                  onClick={handleReanalyze}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  {t.reAnalyze}
                </button>
              </div>

              {/* Resume Editor Modal */}
              {showEditor && (
                <ResumeEditor
                  resumeText={resumeText}
                  result={result}
                  onClose={() => setShowEditor(false)}
                />
              )}
            </div>
          )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-400 dark:text-gray-600">
        <p>
          {t.footerDesc} &middot;{" "}
          <span className="text-brand-500">{t.poweredBy}</span>
        </p>
        <p className="mt-2">
          {t.builtBy}{" "}
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            Rohmat
          </span>{" "}
          — {t.portfolioProject}
        </p>
      </footer>
    </>
  );
}
