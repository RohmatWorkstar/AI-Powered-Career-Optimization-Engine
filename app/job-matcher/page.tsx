"use client";

import { useState, useCallback, useEffect } from "react";
import UploadBox from "@/components/UploadBox";
import { SparklesIcon, DocumentTextIcon, ClipboardCheckIcon, ClipboardIcon, DownloadIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { jsPDF } from "jspdf";

export default function JobMatcherPage() {
  const { t, locale } = useLanguage();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<{ remainingTime: number } | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleMatch = useCallback(async () => {
    if (!resumeFile) {
      setError(t.errorUploadResume);
      return;
    }
    if (!jdFile && !jdText.trim()) {
      setError(t.errorUploadJdOrPaste);
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
    setIsMatching(true);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      if (jdFile) {
        formData.append("jdFile", jdFile);
      }
      if (jdText.trim()) {
        formData.append("jdText", jdText);
      }
      formData.append("locale", locale);

      const res = await fetch("/api/job-matcher", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to tailor resume");
      }

      const data = await res.json();
      setTailoredResume(data.tailoredResume);

      // Increment usage count on success
      usageCount += 1;
      localStorage.setItem("demo_usage_count", usageCount.toString());
      if (usageCount >= 3) {
        localStorage.setItem("demo_cooldown_end", (Date.now() + 30 * 60 * 1000).toString());
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsMatching(false);
    }
  }, [resumeFile, jdFile, jdText, t]);

  const handleCopy = useCallback(async () => {
    if (!tailoredResume) return;
    try {
      await navigator.clipboard.writeText(tailoredResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = tailoredResume;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [tailoredResume]);

  const handleDownloadPDF = useCallback(() => {
    if (!tailoredResume) return;
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 3, "F");
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 3, pageWidth, 1.5, "F");

    let y = 15;
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("Job Matcher", margin, y);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Optimized Resume", margin, y + 6);

    y += 14;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 10;
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);

    const lines = doc.splitTextToSize(tailoredResume, contentWidth);

    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - 25) {
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.setFontSize(7);
        doc.setTextColor(156, 163, 175);
        doc.text("ResumeAI — Job Matcher", pageWidth / 2, pageHeight - 10, { align: "center" });

        doc.addPage();
        y = 20;
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, pageWidth, 2, "F");
      }

      const line = lines[i];
      const isHeader = (line.length < 40 && line === line.toUpperCase() && line.trim().length > 2) ||
                       (line.trim().endsWith(":") && line.length < 50);

      if (isHeader) {
        y += 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(79, 70, 229);
        doc.text(line, margin, y);
        y += 2;
        doc.setDrawColor(199, 210, 254);
        doc.setLineWidth(0.4);
        doc.line(margin, y, margin + Math.min(doc.getTextWidth(line), contentWidth * 0.5), y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(31, 41, 55);
      } else if (line.trim().startsWith("•") || line.trim().startsWith("-") || line.trim().startsWith("–")) {
        doc.setTextColor(79, 70, 229);
        doc.text("•", margin + 2, y);
        doc.setTextColor(31, 41, 55);
        doc.text(line.replace(/^[\s•\-–]+/, "").trim(), margin + 7, y);
        y += 5.5;
      } else if (line.trim() === "") {
        y += 3;
      } else {
        doc.text(line, margin, y);
        y += 5.5;
      }
    }

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(156, 163, 175);
      doc.text("ResumeAI — Job Matcher", pageWidth / 2, pageHeight - 10, { align: "center" });
      doc.text(`${p} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });

      doc.setFillColor(99, 102, 241);
      doc.rect(0, pageHeight - 3, pageWidth, 1.5, "F");
      doc.setFillColor(79, 70, 229);
      doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, "F");
    }

    const fileName = `Tailored_Resume_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }, [tailoredResume]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10 text-center relative overflow-hidden py-4">
        <div className="absolute -top-10 -left-10 h-64 w-64 bg-brand-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse-slow"></div>
        <div className="absolute -top-10 -right-10 h-64 w-64 bg-brand-600/10 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-pulse-slow"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 px-4 py-1.5 mb-6">
            <SparklesIcon className="h-4 w-4 text-brand-500" />
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              {t.newFeature}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
            {t.matcherTitle}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent block mt-2">
              {t.matcherSubtitle}
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            {t.matcherDesc}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
              1. {t.resumeUpload}
            </h2>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              {t.resumeUploadDesc}
            </p>
            <UploadBox onFileSelect={setResumeFile} selectedFile={resumeFile} />
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
              2. {t.targetJobDesc}
            </h2>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              {t.targetJobDescSubtitle}
            </p>
            
            <div className="mb-4">
              <UploadBox onFileSelect={setJdFile} selectedFile={jdFile} />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-gray-900 px-3 text-sm text-gray-500">{t.or}</span>
              </div>
            </div>

            <div className="mt-4">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder={t.pasteJdPlaceholder}
                rows={6}
                disabled={!!jdFile}
                className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {limitInfo && (
            <div className="mt-2 animate-fade-in relative overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/40 dark:to-gray-900 p-8 shadow-sm">
              <div className="absolute -top-10 -right-10 h-32 w-32 bg-brand-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex flex-col gap-6 items-center text-center">
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

          {!limitInfo && (
            <button
              onClick={handleMatch}
              disabled={!resumeFile || (!jdFile && !jdText) || isMatching}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:from-brand-700 hover:to-brand-600 hover:shadow-brand-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isMatching ? (
                <>
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.tailoringResume}
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  {t.matchAndOptimize}
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col h-[800px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-brand-500" />
              {t.tailoredResumeResult}
            </h3>
            {tailoredResume && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {copied ? (
                    <><ClipboardCheckIcon className="h-4 w-4 text-emerald-500" /> {t.copied}</>
                  ) : (
                    <><ClipboardIcon className="h-4 w-4" /> {t.copyToClipboard}</>
                  )}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:from-brand-700 hover:to-brand-600"
                >
                  <DownloadIcon className="h-4 w-4" />
                  {t.downloadPdf}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-950/50">
            {isMatching ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                    <SparklesIcon className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <div className="absolute -inset-2 rounded-2xl border-2 border-brand-500/30 animate-ping" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {t.aiIsWriting}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t.aiWritingDesc}
                  </p>
                </div>
                <div className="w-full max-w-md space-y-3 mt-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3 rounded-full animate-shimmer"
                      style={{
                        width: `${85 - i * 8}%`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : tailoredResume ? (
              <textarea
                value={tailoredResume}
                onChange={(e) => setTailoredResume(e.target.value)}
                className="w-full h-full resize-none bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 font-[inherit] leading-relaxed"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="h-16 w-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t.noResultYet}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  {t.noResultDesc}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
