# CareerReady AI 🚀
### *An Autonomous Multimodal Generative AI Framework for Institutional Placement Readiness and Candidate Skill Intelligence*

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![Framework: SvelteKit](https://img.shields.io/badge/Framework-SvelteKit%205-orange.svg)](https://svelte.dev)
[![AI: Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5-blue.svg)](https://ai.google.dev)
[![TailwindCSS: v4](https://img.shields.io/badge/Styling-TailwindCSS%20v4-38bdf8.svg)](https://tailwindcss.com)

---

## 📌 Abstract
**CareerReady AI** is an advanced, end-to-end Generative AI platform designed for higher education institutions, talent mobility hubs, and recruitment drives. It bridges academic-industry misalignment through automated ATS resume auditing, adaptive LLM-driven skill gap tracking, simulated real-time mock interviews, and personalized career roadmaps.

Designed for peer-reviewed academic publication (IEEE/Springer/ACM), **CareerReady AI** provides dynamic candidate placement scoring, automated institutional analytics, and real-time candidate readiness alerts.

---

## ✨ Key Features & Capabilities

- 📄 **LLM-Driven ATS Resume Evaluator**: Parses PDF resumes via Google Gemini, performing deep keyword-matching against industry job descriptions, grammar checks, and score generation.
- 🎙️ **Interactive AI Mock Interviews**: Live simulated technical, HR, and coding interview rounds with automated evaluation of accuracy, technical depth, articulation, and confidence.
- 🎯 **Dynamic Skill Matrix & Heatmap**: Quantitative tracking across programming languages, database systems, cloud platforms, and soft skills with interactive visual charts.
- 🗺️ **Personalized AI Career Roadmaps**: Generates custom 5-day preparation strategies, course recommendations, and project blueprints.
- 📊 **Institutional Admin & Placement Officer Dashboard**: Real-time analytics on student eligibility, placement drive applications, batch-wide performance metrics, and broadcast alerts.
- 🌐 **Multilingual Support**: Built-in translation pipeline for Tamil, Hindi, and English to ensure equitable access.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [SvelteKit 2](https://kit.svelte.dev/) with Svelte 5 Runes (`$state`, `$derived`) |
| **Styling & UI** | [TailwindCSS v4](https://tailwindcss.com/), Lucide Icons, Modern Dark/Glassmorphism Theme |
| **Generative AI Core** | [Google Gemini AI API](https://ai.google.dev/) (PDF Parsing, Chat Mentorship, Interview Simulation) |
| **Database & Auth** | Firebase (Firestore, Auth, Storage) + Hybrid LocalStorage Offline Mock Mode |
| **Data Visualization** | Chart.js |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js `v18.x` or higher
- `npm` or `pnpm`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/careerready-ai.git
cd careerready-ai

# Install dependencies
npm install
```

### 3. Running in Local Development Mode
By default, **CareerReady AI** runs with zero configuration in offline mock mode using pre-seeded local storage data:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Credentials for Demo & Testing
- **Student Portal**: `student@careerready.ai` | Password: `password123`
- **Admin Portal**: `admin@careerready.ai` | Password: `password123`

---

## 📄 Publication Citation
If you utilize this framework or codebase in your academic research, please cite:

```bibtex
@article{careerready2026,
  title={CareerReady: An Autonomous Multimodal Generative AI Framework for Institutional Placement Readiness and Candidate Skill Intelligence},
  author={Research Development Team},
  journal={IEEE Access / Springer Computer Science Series},
  year={2026}
}
```

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
