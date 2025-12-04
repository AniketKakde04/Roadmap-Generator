# AI Roadmap Generator 🚀

**Live Demo:** [https://roadmap-generator-smoky.vercel.app/](https://roadmap-generator-smoky.vercel.app/)

A powerful, AI-driven application that generates personalized learning roadmaps, conducts mock interviews, and creates study guides to help users master new skills.

## ✨ Features

*   **AI Roadmap Generation:** Create detailed, step-by-step learning paths for any topic, level, and timeline.
*   **Interactive Mock Interviews:** Practice job interviews with an AI hiring manager that adapts to your resume and target role.
*   **Resume Analysis:** Get instant feedback on your resume, including match scores, strength identification, and project suggestions.
*   **Study Guides:** Auto-generate comprehensive study guides with formulas and key concepts.
*   **Aptitude Tests:** Practice with AI-generated aptitude questions tailored to specific topics.
*   **Text-to-Speech:** Listen to roadmaps and interview feedback with natural-sounding AI voice.

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS, Framer Motion
*   **Visualization:** React Flow (for roadmap visualization)
*   **Icons:** Lucide React, React Icons
*   **Deployment:** Vercel

### Backend (Server)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Database:** Supabase (PostgreSQL)
*   **Deployment:** Render

### Automation & AI
*   **Workflow Engine:** n8n (Self-hosted on Render)
*   **AI Models:** Gemini 2.0 Flash, Gemini 1.5 Pro

## 🏗️ Architecture

The project follows a **Client-Server** architecture with a separate automation layer:

1.  **Client (`/client`):** Handles UI/UX, user interactions, and communicates with the backend via REST API.
2.  **Server (`/server`):** Securely manages API keys, handles business logic, communicates with Google Gemini, and triggers n8n workflows.
3.  **n8n Service:** Executes complex, multi-step AI workflows (like Roadmap Generation) to ensure reliability and structured output.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/roadmap-generator.git
    cd roadmap-generator
    ```

2.  **Install Client Dependencies:**
    ```bash
    cd client
    npm install
    ```

3.  **Install Server Dependencies:**
    ```bash
    cd ../server
    npm install
    ```

### Configuration

1.  **Server (`server/.env`):**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=3000
    GEMINI_API_KEY=your_gemini_api_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    N8N_WEBHOOK_URL=your_n8n_webhook_url
    ```

2.  **Client (`client/.env`):**
    Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

### Running Locally

1.  **Start the Backend:**
    ```bash
    cd server
    npm run dev
    ```

2.  **Start the Frontend:**
    ```bash
    cd client
    npm run dev
    ```

3.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Deployment

### Frontend (Vercel)
*   Connect your GitHub repo to Vercel.
*   Set Root Directory to `client`.
*   Add Environment Variable: `VITE_API_URL` (Your Render Backend URL).
*   Add Environment Variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

### Backend (Render)
*   Create a **Web Service** on Render.
*   Connect GitHub repo.
*   Root Directory: `server`.
*   Build Command: `npm install && npm run build` (or just `npm install` if using ts-node).
*   Start Command: `npm start`.
*   Add Environment Variables from `server/.env`.

### n8n (Render)
*   Deploy n8n using the official Docker image.
*   Configure Webhook URL and Google Gemini credentials.

## 🛡️ Security

*   **API Keys:** All sensitive keys (Gemini, n8n) are stored on the backend.
*   **Authentication:** Supabase Auth manages user sessions securely.
*   **Database:** Row Level Security (RLS) protects user data.

## 📄 License

This project is licensed under the ISC License.
