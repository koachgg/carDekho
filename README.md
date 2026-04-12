# AutoPilot: Next-Gen AI Car Advisor

AutoPilot is a sophisticated, AI-driven car recommendation platform designed to help users find their perfect vehicle through natural conversation. It leverages state-of-the-art LLMs to understand user intent, budget, and lifestyle needs, providing real-time re-ranking and personalized insights.

![AutoPilot Landing Page](https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000)

## 🚀 Key Features

- **AI Co-Pilot**: Chat naturally with a virtual car expert to refine your search.
- **Smart Shortlist**: Receive a personalized "Top 3" list based on deep preference extraction.
- **"What-If" Analysis**: Type adjustments (e.g., "What if I increase my budget?") and see real-time catalogue re-ranking.
- **Comprehensive Catalogue**: Browse hundreds of cars with detailed specs, reviews, and high-quality imagery.
- **AI-Powered Comparison**: Get expert verdicts on how different models stack up against each other.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Zustand (State Management)
- **Backend**: Express.js, TypeScript, PostgreSQL
- **Database**: Supabase (PostgreSQL with JSONB support)
- **AI Architecture**: Google Gemini (Intent Extraction), Groq (Fast Reasoning)
- **Hosting**: Vercel (Production Deployment)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Supabase Project (PostgreSQL)
- Google Gemini API Key
- Groq API Key

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/koachgg/carDekho.git
   cd carDekho/autopilot
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `autopilot/` directory and add your keys:
   ```env
   DATABASE_URL=your_supabase_connection_string
   GEMINI_API_KEY=your_key
   GROQ_API_KEY=your_key
   ```

4. **Run the app**:
   ```bash
   npm run dev
   ```
   The frontend will be at `http://localhost:5173` and the backend at `http://localhost:3001`.

## 🌐 Deployment

The application is optimized for **Vercel Serverless Functions**.

### Database Configuration
Ensure your database connection string uses the **Supabase Transaction Pooler** (Port 6543) for best performance in a serverless environment.

### Regional Latency
For maximum performance, deploy your Vercel functions in the **Tokyo (hnd1)** region to be geographically close to the Supabase database.

---

Built with ❤️ for car enthusiasts.
