# 🏥 Vertice AI Health (Humanitarian Edition)

<div align="center">

![Status](https://img.shields.io/badge/Status-Hackathon%20Ready-success)
![AI Model](https://img.shields.io/badge/AI%20Core-Gemini%203%20Pro-8e44ad)
![Architecture](https://img.shields.io/badge/Architecture-Trinity%20Consensus-2ea44f)
![Stack](https://img.shields.io/badge/Stack-Google%20Vertex%20%2B%20React-blue)

**A "High-Tech, Low-Resource" Clinical Decision Support System (CDSS) for humanitarian zones.**
*Designed for 2026. Built with Google Gemini 3 Pro.*

[Features](#-key-features) • [Architecture](#-trinity-architecture) • [Getting Started](#-getting-started) • [Philosophy](#-humanitarian-philosophy)

</div>

---

## 🌍 The Mission
In humanitarian crisis zones, doctors face language barriers, extreme exhaustion, and low patient health literacy. **Vertice AI Health** is not just a chatbot; it's an **Agentic Operating System** designed to operate in low-bandwidth environments, acting as a super-specialist team in the pocket of a field doctor.

## 🚀 Key Features

### 1. 🧠 Trinity Diagnosis Protocol™
We don't rely on a single LLM call. We instantiate **three distinct cognitive personas** that analyze the patient in parallel, followed by a "Judge" agent that fuses the insights using **Adversarial Review**.
*   🛡️ **Dr. Conservative:** Focuses on safety, standard protocols (WHO/MSF), and "do no harm".
*   🔬 **Dr. House (Aggressive):** Hunts for rare diseases, "zebras", and hidden correlations.
*   🎓 **Prof. Academic:** Analyzes pathophysiology and evidence-based likelihood ratios.
*   ⚖️ **The Judge:** A temperature-0 agent that calculates a **Confidence Score**. If < 60%, the diagnosis is **blocked** for safety.

### 2. 🎙️ Vox Medicus (Multimodal Scribe)
**No typing required.** Using Gemini 3 Pro's native multimodal capabilities and the **Opus** codec for ultra-low bandwidth:
*   Listens to the consultation audio directly.
*   Analyzes **acoustics** (detects dyspnea, pain in voice, anxiety).
*   Auto-fills complex clinical forms (`PatientData` JSON) from unstructured speech.

### 3. 🎨 Generative Pictogram Prescriptions
Solving the **Health Illiteracy** crisis.
*   Instead of text instructions ("Take 2 pills every 8h"), the system generates a **Visual Recipe**.
*   Uses a **React SVG Engine** driven by Gemini's structured output to render offline-capable pictograms (Sun, Moon, Pill quantities) that any patient can understand regardless of language.

### 4. 🛰️ Telemedicine Hub (Google Stack)
*   **Smart Referral:** Generates <100 word summaries optimized for WhatsApp/Satellite text.
*   **Native Meet Integration:** One-click seamless video handoff to specialists.

---

## 🏗️ Trinity Architecture

The system runs **Client-Side** (Serverless) to ensure privacy and zero infrastructure costs for NGOs.

```mermaid
graph TD
    A[Doctor Input (Voice/Text/Img)] --> B{Vox Medicus}
    B --> C[Structured Patient Data]
    C --> D[Trinity Router]
    
    D --> E[Persona: Conservative]
    D --> F[Persona: Aggressive]
    D --> G[Persona: Academic]
    
    E & F & G --> H[The Judge (Consensus Engine)]
    
    H -- Score < 60% --> I[⛔ Safety Block Protocol]
    H -- Score > 60% --> J[✅ Clinical Report]
    
    J --> K[Generative Pictograms (Patient View)]
```

## 🛠️ Tech Stack (2026 Standard)

*   **AI Core:** Google Gemini 3 Pro (via `@google/genai` SDK).
*   **Frontend:** React 19 + Vite (TypeScript).
*   **Styling:** Tailwind CSS (Medical Liquid Glass Theme).
*   **Audio:** MediaRecorder API with Opus Codec (WebM).
*   **Icons:** Lucide React (Dynamic Rendering).

## ⚡ Getting Started

### Prerequisites
*   Node.js 20+
*   A Google Gemini API Key (Vertex AI or AI Studio)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/JuanCS-Dev/vertice-health.git
    cd vertice-health
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🛡️ "Padrão Pagani" & Constitution

This codebase adheres to the **Constituição Vértice v3.0**:
*   **Zero Placeholders:** No `// TODO` in critical paths.
*   **Type Safety:** Strict TypeScript interfaces for all AI inputs/outputs.
*   **Sovereignty of Intent:** The AI never "fakes" a diagnosis. If it doesn't know, it says so.

---

## 🤝 Contributing

This is an open-source project for the **Google Gemini Hackathon**.
Pull requests focused on accessibility, offline-first capabilities, and localization are welcome.

**License:** MIT
**Author:** JuanCS-Dev (Executor Tático)