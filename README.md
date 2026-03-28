# 🚀 ResumeAI: AI-Powered Career Optimization Engine

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_3_Flash-blue?style=flat-square&logo=google-gemini)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**ResumeAI** is a production-grade SaaS-style application designed to bridge the gap between job seekers and Applicant Tracking Systems (ATS). Built with **Next.js 16**, **React 19**, and **Google's Gemini 3 Flash AI**, this tool provides deep semantic analysis of resumes against specific job descriptions.

---

## 🎯 The Problem & Solution

**The Problem:** Many talented candidates are filtered out by ATS before a human even sees their resume due to missing keywords or poor formatting.
**The Solution:** ResumeAI leverages Large Language Models (LLMs) to provide actionable insights, scoring, and targeted suggestions to help candidates bypass automated filters and land more interviews.

## ✨ Core Features

- **🛡️ Industry-Standard Parsing** — Robust text extraction from `PDF`, `DOCX`, and `TXT` files using multi-format buffer processing.
- **🧠 Semantic Match Engine** — Powered by **Gemini 3 Flash Preview** for high-speed, cost-effective, and accurate content analysis.
- **📊 Interactive Dashboard** — Real-time visualization of ATS score, match percentage, and keyword density.
- **🛠️ Actionable Insights** — Categorized feedback (Strengths, Weaknesses, Suggestions) based on semantic gap analysis.
- **🌙 Premium UI/UX** — Modern Dark Mode default with glassmorphism effects and smooth Framer-like animations.

---

## 🛠️ Technical Stack & Architecture

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4, Custom CSS Variables |
| **AI / LLM** | Google Generative AI SDK (`@google/genai` ^1.46.0) — Gemini 3 Flash Preview |
| **PDF Parsing** | `pdf-parse` ^1.1.1 |
| **DOCX Parsing** | `mammoth` ^1.7.0 |
| **Linting** | ESLint 9, eslint-config-next |
| **Build Tools** | PostCSS, Autoprefixer |

### 🧩 Key Implementation Highlights

- **Secure API Integration**: Implemented server-side proxies via Next.js Route Handlers to protect private Gemini API keys.
- **Robust Error Handling**: Customized 429 (Rate Limit), 404 (Model Unavailable), and Auth error states with user-friendly UI feedback.
- **Adaptive UI**: Built with a "Dark First" design philosophy to reduce eye strain during prolonged resume editing.
- **Mock Fallback Mode**: Gracefully falls back to mock analysis data when no API key is configured.

---

## 📁 Project Structure

```
AI-analyzer/
├── app/
│   ├── api/              # Next.js Route Handlers (server-side AI proxy)
│   ├── globals.css        # Global styles & CSS variables
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main dashboard page
├── components/
│   ├── EmptyStateIllustration.tsx
│   ├── ResultCard.tsx
│   ├── ScoreBar.tsx
│   ├── UploadBox.tsx
│   └── icons.tsx
├── lib/
│   └── ai.ts             # Gemini AI integration & analysis engine
├── types/
│   └── pdf-parse.d.ts    # Type declarations for pdf-parse
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

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

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📈 Future Roadmap

- [ ] Multi-resume comparison (A/B testing for resumes).
- [ ] Auto-generate a "Cover Letter" based on the match analysis.
- [ ] Direct export to professional PDF templates.
- [ ] Integration with LinkedIn API for one-click profile analysis.
- [ ] Multi-language support (English & Indonesian).

## 🤝 Contributing

This is a portfolio project designed to showcase full-stack development and AI integration skills. Feedback and contributions are welcome!

---

**Built with ❤️ by [Rohmat]**  
*Showcasing modern web development, AI integration, and user-centric design.*
