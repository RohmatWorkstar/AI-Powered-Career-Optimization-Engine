"use client";

import { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  XMarkLargeIcon,
  DownloadIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
  PencilSquareIcon,
} from "./icons";
import type { AnalysisResult } from "@/lib/ai";

interface ResumeEditorProps {
  resumeText: string;
  result: AnalysisResult;
  onClose: () => void;
}

export default function ResumeEditor({ resumeText, result, onClose }: ResumeEditorProps) {
  const { t, locale } = useLanguage();
  const [improvedText, setImprovedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"original" | "improved">("improved");

  // Fetch AI-improved resume on mount
  useEffect(() => {
    let cancelled = false;

    const fetchImprovement = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const weaknesses = result.weaknesses[locale] || result.weaknesses.en;
        const suggestions = result.suggestions[locale] || result.suggestions.en;

        const res = await fetch("/api/improve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, weaknesses, suggestions }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to improve resume");
        }

        const data = await res.json();
        if (!cancelled) {
          setImprovedText(data.improvedText);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchImprovement();
    return () => { cancelled = true; };
  }, [resumeText, result, locale]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(improvedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = improvedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [improvedText]);

  const handleDownloadPDF = useCallback(() => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // ── TOP GRADIENT BAR ──
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 3, "F");
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 3, pageWidth, 1.5, "F");

    // ── HEADER ──
    let y = 15;
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("ResumeAI", margin, y);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(t.improvedResume, margin, y + 6);

    // Date
    const dateStr = new Date().toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(dateStr, pageWidth - margin, y + 6, { align: "right" });

    // Separator
    y += 14;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 10;

    // ── RESUME CONTENT ──
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);

    const lines = doc.splitTextToSize(improvedText, contentWidth);

    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - 25) {
        // Footer on current page
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.setFontSize(7);
        doc.setTextColor(156, 163, 175);
        doc.text("ResumeAI — AI-Powered Resume Improvement", pageWidth / 2, pageHeight - 10, { align: "center" });

        doc.addPage();
        y = 20;

        // Top bar on new page
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, pageWidth, 2, "F");
      }

      const line = lines[i];

      // Check if line looks like a section header (ALL CAPS or short and ends with :)
      const isHeader = (line.length < 40 && line === line.toUpperCase() && line.trim().length > 2) ||
                       (line.trim().endsWith(":") && line.length < 50);

      if (isHeader) {
        y += 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(79, 70, 229);
        doc.text(line, margin, y);
        y += 2;
        // Small underline
        doc.setDrawColor(199, 210, 254);
        doc.setLineWidth(0.4);
        doc.line(margin, y, margin + Math.min(doc.getTextWidth(line), contentWidth * 0.5), y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(31, 41, 55);
      } else if (line.trim().startsWith("•") || line.trim().startsWith("-") || line.trim().startsWith("–")) {
        // Bullet points
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

    // ── FINAL FOOTER ──
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(156, 163, 175);
      doc.text("ResumeAI — AI-Powered Resume Improvement", pageWidth / 2, pageHeight - 10, { align: "center" });
      doc.text(`${p} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });

      // Bottom gradient
      doc.setFillColor(99, 102, 241);
      doc.rect(0, pageHeight - 3, pageWidth, 1.5, "F");
      doc.setFillColor(79, 70, 229);
      doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, "F");
    }

    const fileName = `ResumeAI_Improved_Resume_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }, [improvedText, locale, t]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    const weaknesses = result.weaknesses[locale] || result.weaknesses.en;
    const suggestions = result.suggestions[locale] || result.suggestions.en;

    fetch("/api/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, weaknesses, suggestions }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to improve resume");
        }
        return res.json();
      })
      .then((data) => {
        setImprovedText(data.improvedText);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setIsLoading(false);
      });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-modal-overlay">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-[95vw] max-w-6xl h-[90vh] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl animate-modal-content overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
              <PencilSquareIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {t.editorTitle}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.editorDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isLoading && !error && improvedText && (
              <>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {copied ? (
                    <>
                      <ClipboardCheckIcon className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-4 w-4" />
                      {t.copyToClipboard}
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:from-brand-700 hover:to-brand-600 active:scale-[0.97]"
                >
                  <DownloadIcon className="h-4 w-4" />
                  {t.downloadPdf}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-500 dark:text-gray-400 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label={t.closeEditor}
            >
              <XMarkLargeIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex lg:hidden border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("original")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition ${
              activeTab === "original"
                ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.originalResume}
          </button>
          <button
            onClick={() => setActiveTab("improved")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition ${
              activeTab === "improved"
                ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.improvedResume}
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Original (left panel / tab) */}
          <div
            className={`flex-1 flex flex-col border-r border-gray-200 dark:border-gray-800 ${
              activeTab === "original" ? "flex" : "hidden lg:flex"
            }`}
          >
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t.originalResume}
              </span>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-[inherit]">
                {resumeText}
              </pre>
            </div>
          </div>

          {/* Improved (right panel / tab) */}
          <div
            className={`flex-1 flex flex-col ${
              activeTab === "improved" ? "flex" : "hidden lg:flex"
            }`}
          >
            <div className="px-4 py-2.5 bg-brand-50 dark:bg-brand-950/20 border-b border-brand-100 dark:border-brand-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {t.improvedResume} ✨
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
                  {/* Loading animation */}
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                      <PencilSquareIcon className="h-8 w-8 text-white animate-pulse" />
                    </div>
                    <div className="absolute -inset-2 rounded-2xl border-2 border-brand-500/30 animate-ping" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {t.generatingImprovement}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t.generatingDesc}
                    </p>
                  </div>
                  {/* Shimmer lines */}
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
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
                  <div className="h-14 w-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {t.improveError}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 transition hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    {t.retryImprove}
                  </button>
                </div>
              ) : (
                <textarea
                  value={improvedText}
                  onChange={(e) => setImprovedText(e.target.value)}
                  className="w-full h-full resize-none p-5 text-sm leading-relaxed text-gray-800 dark:text-gray-200 bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 font-[inherit]"
                  placeholder="AI improved text will appear here..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Toast notification */}
        {copied && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-toast">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-gray-900 shadow-xl">
              <ClipboardCheckIcon className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
              {t.copied}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
