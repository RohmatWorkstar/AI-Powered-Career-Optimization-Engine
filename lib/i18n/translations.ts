export type Locale = "en" | "id";

export interface Translations {
  // Header
  appName: string;
  poweredBy: string;
  toggleDarkMode: string;

  // Hero
  badge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;

  // Upload
  resumeUpload: string;
  resumeUploadDesc: string;
  dragDrop: string;
  dropHere: string;
  clickBrowse: string;
  or: string;
  supportsFormats: string;
  removeFile: string;

  // Job Description
  jobDescription: string;
  optional: string;
  jobDescriptionDesc: string;
  jobDescriptionPlaceholder: string;

  // Analyze
  analyzeResume: string;
  analyzing: string;
  uploadFirst: string;

  // Results
  atsScore: string;
  scoreBreakdown: string;
  jobMatch: string;
  keywordDensity: string;
  formatQuality: string;
  strengths: string;
  areasToImprove: string;
  suggestions: string;
  reAnalyze: string;

  // Score messages
  scoreExcellent: string;
  scoreGood: string;
  scoreNeedsWork: string;

  // Empty state
  emptyStateText: string;

  // Footer
  footerDesc: string;
  builtBy: string;
  portfolioProject: string;

  // Errors
  errorUploadResume: string;
  errorAnalysisFailed: string;
  errorSomethingWrong: string;

  // Limit
  limitReachedTitle: string;
  limitReachedMessage: string;
  limitCooldownMessage: string;
  timeRemaining: string;

  // PDF Report
  downloadReport: string;
  reportTitle: string;
  reportSubtitle: string;
  reportGeneratedOn: string;
  reportScoreLabel: string;
  reportMatchLabel: string;
  reportKeywordLabel: string;
  reportFormatLabel: string;
  reportStrengths: string;
  reportWeaknesses: string;
  reportSuggestions: string;
  reportFooter: string;
  reportScoreExcellent: string;
  reportScoreGood: string;
  reportScoreNeedsWork: string;

  // Resume Editor
  improveResume: string;
  editorTitle: string;
  editorDesc: string;
  originalResume: string;
  improvedResume: string;
  generatingImprovement: string;
  generatingDesc: string;
  copyToClipboard: string;
  copied: string;
  downloadPdf: string;
  closeEditor: string;
  improveError: string;
  retryImprove: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    // Header
    appName: "ResumeAI",
    poweredBy: "Powered by Advanced AI",
    toggleDarkMode: "Toggle dark mode",

    // Hero
    badge: "AI-Powered Analysis",
    heroTitle: "Optimize Your Resume with ",
    heroTitleHighlight: "AI Insights",
    heroDescription:
      "Upload your resume, paste a job description, and get instant feedback on ATS score, match rate, strengths, and targeted improvement areas.",

    // Upload
    resumeUpload: "Resume Upload",
    resumeUploadDesc: "Upload your CV in PDF, DOCX, or TXT format",
    dragDrop: "Drag & drop your resume",
    dropHere: "Drop your resume here",
    clickBrowse: "click to browse",
    or: "or",
    supportsFormats: "Supports PDF, DOCX, TXT",
    removeFile: "Remove file",

    // Job Description
    jobDescription: "Job Description",
    optional: "Optional",
    jobDescriptionDesc: "Paste the job posting for tailored matching",
    jobDescriptionPlaceholder:
      "Paste the full job description here to get a tailored match score and targeted suggestions...",

    // Analyze
    analyzeResume: "Analyze Resume",
    analyzing: "Analyzing your resume...",
    uploadFirst: "Please upload your resume before analyzing.",

    // Results
    atsScore: "ATS Score",
    scoreBreakdown: "Score Breakdown",
    jobMatch: "Job Match %",
    keywordDensity: "Keyword Density",
    formatQuality: "Format Quality",
    strengths: "Strengths",
    areasToImprove: "Areas to Improve",
    suggestions: "Suggestions",
    reAnalyze: "Re-analyze",

    // Score messages
    scoreExcellent: "🎉 Excellent! Your resume performs well.",
    scoreGood: "👍 Good — a few improvements needed.",
    scoreNeedsWork: "⚠️ Needs work to pass ATS filters.",

    // Empty state
    emptyStateText: "Upload a resume to get started",

    // Footer
    footerDesc: "ResumeAI — AI Resume Analyzer & Job Matching System",
    builtBy: "Built by",
    portfolioProject: "Portfolio Project",

    // Errors
    errorUploadResume: "Please upload your resume before analyzing.",
    errorAnalysisFailed: "Analysis failed.",
    errorSomethingWrong: "Something went wrong.",

    // Limit
    limitReachedTitle: "Live Demo Limit Reached",
    limitReachedMessage: "Thank you for exploring this project! This AI Resume Analyzer is a technical demo built by Rohmat to showcase expertise in full-stack development, AI integration, and modern UX design. As a live portfolio project, usage is limited to 3 analyses per user.",
    limitCooldownMessage: "Please wait 30 minutes before your next analysis. If you're an HR professional or recruiter looking for an experienced software developer to join your team, feel free to reach out directly!",
    timeRemaining: "Time remaining",

    // PDF Report
    downloadReport: "Download Report",
    reportTitle: "Resume Analysis Report",
    reportSubtitle: "AI-Powered Analysis by ResumeAI",
    reportGeneratedOn: "Generated on",
    reportScoreLabel: "ATS Compatibility Score",
    reportMatchLabel: "Job Match Percentage",
    reportKeywordLabel: "Keyword Density",
    reportFormatLabel: "Format Quality",
    reportStrengths: "Strengths",
    reportWeaknesses: "Areas to Improve",
    reportSuggestions: "Actionable Suggestions",
    reportFooter: "This report was generated by ResumeAI — AI-Powered Resume Analyzer",
    reportScoreExcellent: "Excellent",
    reportScoreGood: "Good",
    reportScoreNeedsWork: "Needs Improvement",

    // Resume Editor
    improveResume: "Improve Resume",
    editorTitle: "AI Resume Editor",
    editorDesc: "Review and edit your AI-improved resume, then download as PDF",
    originalResume: "Original Resume",
    improvedResume: "AI Improved",
    generatingImprovement: "AI is improving your resume...",
    generatingDesc: "Analyzing weaknesses and applying targeted improvements",
    copyToClipboard: "Copy to Clipboard",
    copied: "Copied!",
    downloadPdf: "Download PDF",
    closeEditor: "Close",
    improveError: "Failed to generate improvements. Please try again.",
    retryImprove: "Retry",
  },
  id: {
    // Header
    appName: "ResumeAI",
    poweredBy: "Didukung oleh Kecerdasan AI",
    toggleDarkMode: "Alihkan mode gelap",

    // Hero
    badge: "Analisis Berbasis AI",
    heroTitle: "Optimalkan Resume Anda dengan ",
    heroTitleHighlight: "Wawasan AI",
    heroDescription:
      "Unggah resume, tempel deskripsi pekerjaan, dan dapatkan analisis instan skor ATS, tingkat kecocokan, kekuatan, dan area perbaikan yang ditargetkan.",

    // Upload
    resumeUpload: "Unggah Resume",
    resumeUploadDesc: "Unggah CV Anda dalam format PDF, DOCX, atau TXT",
    dragDrop: "Seret & lepas resume Anda",
    dropHere: "Lepas resume Anda di sini",
    clickBrowse: "klik untuk jelajah",
    or: "atau",
    supportsFormats: "Mendukung PDF, DOCX, TXT",
    removeFile: "Hapus file",

    // Job Description
    jobDescription: "Deskripsi Pekerjaan",
    optional: "Opsional",
    jobDescriptionDesc: "Tempel lowongan pekerjaan untuk pencocokan yang disesuaikan",
    jobDescriptionPlaceholder:
      "Tempel deskripsi pekerjaan lengkap di sini untuk mendapatkan skor kecocokan yang disesuaikan dan saran yang ditargetkan...",

    // Analyze
    analyzeResume: "Analisis Resume",
    analyzing: "Menganalisis resume Anda...",
    uploadFirst: "Silakan unggah resume sebelum menganalisis.",

    // Results
    atsScore: "Skor ATS",
    scoreBreakdown: "Rincian Skor",
    jobMatch: "Kecocokan Pekerjaan %",
    keywordDensity: "Kepadatan Kata Kunci",
    formatQuality: "Kualitas Format",
    strengths: "Kekuatan",
    areasToImprove: "Area Perbaikan",
    suggestions: "Saran",
    reAnalyze: "Analisis Ulang",

    // Score messages
    scoreExcellent: "🎉 Luar biasa! Resume Anda memiliki performa yang baik.",
    scoreGood: "👍 Bagus — perlu beberapa perbaikan.",
    scoreNeedsWork: "⚠️ Perlu perbaikan untuk melewati filter ATS.",

    // Empty state
    emptyStateText: "Unggah resume untuk memulai",

    // Footer
    footerDesc: "ResumeAI — Penganalisis Resume AI & Sistem Pencocokan Kerja",
    builtBy: "Dibuat oleh",
    portfolioProject: "Proyek Portofolio",

    // Errors
    errorUploadResume: "Silakan unggah resume sebelum menganalisis.",
    errorAnalysisFailed: "Analisis gagal.",
    errorSomethingWrong: "Terjadi kesalahan.",

    // Limit
    limitReachedTitle: "Batas Demo Tercapai",
    limitReachedMessage: "Terima kasih telah mencoba proyek ini! AI Resume Analyzer ini adalah demo teknis yang dibangun oleh Rohmat untuk menampilkan keahlian dalam pengembangan full-stack, integrasi AI, dan desain UX modern. Sebagai proyek portofolio, penggunaan dibatasi hingga 3 analisis per pengguna.",
    limitCooldownMessage: "Mohon tunggu 30 menit sebelum analisis berikutnya. Jika Anda seorang profesional HR atau rekruter yang sedang mencari pengembang perangkat lunak berpengalaman untuk bergabung dengan tim Anda, jangan ragu untuk menghubungi secara langsung!",
    timeRemaining: "Waktu tersisa",

    // PDF Report
    downloadReport: "Unduh Laporan",
    reportTitle: "Laporan Analisis Resume",
    reportSubtitle: "Analisis Berbasis AI oleh ResumeAI",
    reportGeneratedOn: "Dibuat pada",
    reportScoreLabel: "Skor Kompatibilitas ATS",
    reportMatchLabel: "Persentase Kecocokan Pekerjaan",
    reportKeywordLabel: "Kepadatan Kata Kunci",
    reportFormatLabel: "Kualitas Format",
    reportStrengths: "Kekuatan",
    reportWeaknesses: "Area Perbaikan",
    reportSuggestions: "Saran yang Dapat Ditindaklanjuti",
    reportFooter: "Laporan ini dihasilkan oleh ResumeAI — Penganalisis Resume Berbasis AI",
    reportScoreExcellent: "Luar Biasa",
    reportScoreGood: "Bagus",
    reportScoreNeedsWork: "Perlu Perbaikan",

    // Resume Editor
    improveResume: "Perbaiki Resume",
    editorTitle: "Editor Resume AI",
    editorDesc: "Tinjau dan edit resume yang diperbaiki AI, lalu unduh sebagai PDF",
    originalResume: "Resume Asli",
    improvedResume: "Diperbaiki AI",
    generatingImprovement: "AI sedang memperbaiki resume Anda...",
    generatingDesc: "Menganalisis kelemahan dan menerapkan perbaikan yang ditargetkan",
    copyToClipboard: "Salin ke Clipboard",
    copied: "Disalin!",
    downloadPdf: "Unduh PDF",
    closeEditor: "Tutup",
    improveError: "Gagal membuat perbaikan. Silakan coba lagi.",
    retryImprove: "Coba Lagi",
  },
};
