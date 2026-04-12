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

## 🧠 Design & Development Reflections

### 1. What did you build and why? What did you deliberately cut?
I built **AutoPilot**, an AI-first car advisor that mimics a premium dealership experience. Buying a car is overwhelming; this tool simplifies it by letting users talk naturally about their life (e.g., "I need a car for weekly grocery runs and family trips") instead of filtering through 50 technical specs.

**Deliberate Cuts:**
- **User Authentication**: To keep the demo frictionless, I opted for UUID-based sessions instead of a full login flow. 
- **Payment/Booking Integration**: Focused on the "Discovery" and "Comparison" phases rather than the "Checkout" phase.
- **Real-time Inventory**: Used a robust seeded dataset instead of live-scraping, which ensures speed and reliability for the advisor logic.

### 2. What’s your tech stack and why did you pick it?
- **React/TypeScript**: For a highly interactive, "apps-like" frontend that provides immediate feedback.
- **Supabase (Postgres)**: Picked for its excellent **JSONB support**, which is essential for storing and querying the complex AI-generated preference vectors.
- **Vercel**: The industry standard for frontend speed and serverless backend scaling.

### 3. AI Delegation vs. Manual Effort
- **What was delegated to AI?**
  - **The Intelligence Layer**: Intent extraction and personalized reasoning are handled by Gemini/Groq.
  - **Boilerplate**: AI helped quickly generate the initial React component shells and SQL migration scripts.
- **What was done manually?**
  - **Deployment Engineering**: Troubleshooting regional latency and Supabase connection poolers required deep manual tuning that standard AI assistants often overlook.
  - **State Logic**: Designing the flow of how preferences "evolve" during a conversation.
- **Where did tools help most?** Speeding up the "Visual to Code" pipeline—getting the premium glassmorphism UI from concept to CSS in minutes.
- **Where did they get in the way?** Debugging serverless-specific constraints (read-only filesystems, 10s timeouts) often required going against "standard" AI suggestions.

### 4. If I had another 4 hours, what would I add?
- **Proper Auth & Profiles**: Allow users to save their shortlists across devices indefinitely.
- **Interactive Price Trends**: Add charts showing how the price is expected to depreciate over 5 years.
- **Mobile Native Polish**: While responsive, a dedicated "swipe-to-compare" mobile interface would be a game-changer.
- **Smart Filter Sidebar**: A hybrid approach where manual filters update the AI's understanding in real-time.

---

Built with ❤️ for car enthusiasts.
