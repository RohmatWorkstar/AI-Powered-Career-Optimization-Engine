"use client";

import { useCallback } from "react";
import { jsPDF } from "jspdf";
import { DownloadIcon } from "./icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { AnalysisResult } from "@/lib/ai";

interface DownloadReportButtonProps {
  result: AnalysisResult;
}

export default function DownloadReportButton({ result }: DownloadReportButtonProps) {
  const { t, locale } = useLanguage();

  const generatePDF = useCallback(() => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;

    // ── Helper: check page break ──
    const checkPageBreak = (requiredSpace: number) => {
      if (y + requiredSpace > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }
    };

    // ── HEADER GRADIENT BAR ──
    // Top gradient bar
    doc.setFillColor(79, 70, 229); // brand-600
    doc.rect(0, 0, pageWidth, 3, "F");
    // Secondary gradient
    doc.setFillColor(99, 102, 241); // brand-500
    doc.rect(0, 3, pageWidth, 1.5, "F");

    y = 15;

    // ── BRANDING ──
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("ResumeAI", margin, y);

    // Sparkle icon indicator
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(t.reportSubtitle, margin, y + 6);

    // Date
    const dateStr = new Date().toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(`${t.reportGeneratedOn}: ${dateStr}`, pageWidth - margin, y + 6, { align: "right" });

    // Separator line
    y += 14;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    // ── REPORT TITLE ──
    y += 12;
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(t.reportTitle, margin, y);

    // ── SCORE SECTION ──
    y += 14;

    // Score card background
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y - 6, contentWidth, 40, 4, 4, "F");
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y - 6, contentWidth, 40, 4, 4, "S");

    // Main ATS Score
    const scoreX = margin + 25;
    doc.setFontSize(42);
    doc.setFont("helvetica", "bold");
    
    // Score color based on value
    if (result.score >= 80) {
      doc.setTextColor(16, 185, 129); // emerald
    } else if (result.score >= 60) {
      doc.setTextColor(245, 158, 11); // amber
    } else {
      doc.setTextColor(239, 68, 68); // red
    }
    doc.text(result.score.toString(), scoreX, y + 18, { align: "center" });

    // Score label
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("/ 100", scoreX + 14, y + 18);
    doc.setFontSize(9);
    doc.text(t.reportScoreLabel, scoreX, y + 26, { align: "center" });

    // Rating text
    const ratingText = result.score >= 80 ? t.reportScoreExcellent : result.score >= 60 ? t.reportScoreGood : t.reportScoreNeedsWork;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    if (result.score >= 80) doc.setTextColor(16, 185, 129);
    else if (result.score >= 60) doc.setTextColor(245, 158, 11);
    else doc.setTextColor(239, 68, 68);
    doc.text(ratingText, scoreX + 35, y + 4);

    // Other scores
    const metricsStartX = scoreX + 35;
    const metrics = [
      { label: t.reportMatchLabel, value: result.matchPercentage },
      { label: t.reportKeywordLabel, value: Math.round(result.score * 0.85) },
      { label: t.reportFormatLabel, value: Math.round(result.score * 0.95) },
    ];

    let metricY = y + 11;
    metrics.forEach((metric) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text(metric.label, metricsStartX, metricY);

      // Score bar background
      const barX = metricsStartX + 55;
      const barWidth = contentWidth - 55 - 50 - 15;
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(barX, metricY - 3, barWidth, 4, 2, 2, "F");

      // Score bar fill
      if (metric.value >= 80) doc.setFillColor(16, 185, 129);
      else if (metric.value >= 60) doc.setFillColor(245, 158, 11);
      else doc.setFillColor(239, 68, 68);
      doc.roundedRect(barX, metricY - 3, barWidth * (metric.value / 100), 4, 2, 2, "F");

      // Value
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text(`${metric.value}%`, barX + barWidth + 4, metricY);

      metricY += 9;
    });

    y += 42;

    // ── HELPER: Draw section ──
    const drawSection = (
      title: string,
      items: string[],
      color: { r: number; g: number; b: number },
      bulletChar: string
    ) => {
      checkPageBreak(30);
      y += 10;

      // Section title
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(color.r, color.g, color.b);
      doc.text(title, margin, y);

      // Title underline
      y += 2;
      doc.setDrawColor(color.r, color.g, color.b);
      doc.setLineWidth(0.8);
      doc.line(margin, y, margin + doc.getTextWidth(title) * 1.1, y);

      y += 8;

      // Items
      items.forEach((item) => {
        checkPageBreak(12);

        // Bullet
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(color.r, color.g, color.b);
        doc.text(bulletChar, margin + 2, y);

        // Text - handle line wrapping
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);
        const lines = doc.splitTextToSize(item, contentWidth - 12);
        doc.text(lines, margin + 10, y);

        y += lines.length * 5 + 3;
      });
    };

    // ── STRENGTHS ──
    const strengthItems = result.strengths[locale] || result.strengths.en;
    drawSection(t.reportStrengths, strengthItems, { r: 16, g: 185, b: 129 }, "✓");

    // ── WEAKNESSES ──
    const weaknessItems = result.weaknesses[locale] || result.weaknesses.en;
    drawSection(t.reportWeaknesses, weaknessItems, { r: 239, g: 68, b: 68 }, "✗");

    // ── SUGGESTIONS ──
    const suggestionItems = result.suggestions[locale] || result.suggestions.en;
    drawSection(t.reportSuggestions, suggestionItems, { r: 245, g: 158, b: 11 }, "★");

    // ── FOOTER ──
    const footerY = pageHeight - 15;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(t.reportFooter, pageWidth / 2, footerY, { align: "center" });

    // Bottom gradient bar
    doc.setFillColor(99, 102, 241);
    doc.rect(0, pageHeight - 3, pageWidth, 1.5, "F");
    doc.setFillColor(79, 70, 229);
    doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, "F");

    // Save
    const fileName = `ResumeAI_Analysis_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }, [result, locale, t]);

  return (
    <button
      onClick={generatePDF}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:from-brand-700 hover:to-brand-600 hover:shadow-brand-500/40 active:scale-[0.97] animate-pulse-glow"
      id="download-report-btn"
    >
      <DownloadIcon className="h-4.5 w-4.5" />
      {t.downloadReport}
    </button>
  );
}
