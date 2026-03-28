# 🚀 ResumeAI: AI-Powered Career Optimization Engine

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_2.0-blue?style=flat-square&logo=google-gemini)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**ResumeAI** is a production-grade SaaS-style application designed to bridge the gap between job seekers and Applicant Tracking Systems (ATS). Built with **Next.js 15** and **Google's Gemini AI**, this tool provides deep semantic analysis of resumes against specific job descriptions.

---

## 🎯 The Problem & Solution

**The Problem:** Many talented candidates are filtered out by ATS before a human even sees their resume due to missing keywords or poor formatting.
**The Solution:** ResumeAI leverages Large Language Models (LLMs) to provide actionable insights, scoring, and targeted suggestions to help candidates bypass automated filters and land more interviews.

## ✨ Core Features

- **🛡️ Industry-Standard Parsing** — Robust text extraction from `PDF`, `DOCX`, and `TXT` files using multi-format buffer processing.
- **🧠 Semantic Match Engine** — Powered by **Gemini 1.5 Flash** for high-speed, cost-effective, and accurate content analysis.
- **📊 Interactive Dashboard** — Real-time visualization of ATS score, match percentage, and keyword density.
- **🛠️ Actionable Insights** — Categorized feedback (Strengths, Weaknesses, Suggestions) based on semantic gap analysis.
- **🌙 Premium UI/UX** — Modern Dark Mode default with glassmorphism effects and smooth Framer-like animations.

---

## 🛠️ Technical Stack & Architecture

- **Frontend**: React 19, Next.js 15 (App Router), Tailwind CSS.
- **Backend**: Next.js Route Handlers (Server-side processing for secure API communication).
- **AI/LLM**: Google Generative AI SDK (`@google/genai`).
- **Parsing**: `pdf-parse` for binary PDF extraction and `mammoth` for DOCX structure parsing.
- **Styling**: Custom CSS variables for a dynamic theme engine.

### 🧩 Key Implementation Highlights

- **Secure API Integration**: Implemented server-side proxies to protect private Gemini API keys.
- **Robust Error Handling**: Customized 429 (Rate Limit) and 401 (Auth) error states with user-friendly UI feedback.
- **Adaptive UI**: Built with a "Dark First" design philosophy to reduce eye strain during prolonged resume editing.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### 2. Installation
```bash
git clone https://github.com/yourusername/AI-analyzer.git
cd AI-analyzer
npm install
```

### 3. Configuration
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run
```bash
npm run dev
```

---

## 📈 Future Roadmap

- [ ] Multi-resume comparison (A/B testing for resumes).
- [ ] Auto-generate a "Cover Letter" based on the match analysis.
- [ ] Direct export to professional PDF templates.
- [ ] Integration with LinkedIn API for one-click profile analysis.

## 🤝 Contributing

This is a portfolio project designed to showcase full-stack development and AI integration skills. Feedback and contributions are welcome!

---

**Built with ❤️ by [Rohmat]**  
*Showcasing modern web development, AI integration, and user-centric design.*
