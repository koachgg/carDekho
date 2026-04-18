# AutoPilot

> AI-powered car advisor — natural language in, ranked and explained vehicle recommendations out.

**[🔗 Live Demo → autopilot-sable.vercel.app](https://autopilot-sable.vercel.app/)**

![React](https://img.shields.io/badge/React-TypeScript-blue?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-primary_LLM-orange?style=flat-square)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-purple?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-Tokyo_hnd1-black?style=flat-square)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [AI Layer: Dual-Model with Failover](#1-ai-layer-dual-model-with-failover)
- [Intent Extraction](#2-intent-extraction-intentservicets)
- [Scoring & Ranking Engine](#3-scoring--ranking-engine)
- [Serverless Optimizations](#4-serverless-optimizations)
- [Database Architecture](#5-database-architecture)
- [Frontend State & What-If Analysis](#6-frontend-state--what-if-analysis)
- [Local Setup](#local-setup)

---

## Architecture Overview

```
User message
    │
    ▼
intent.service.ts          ← extracts typed UserIntent schema via LLM
    │
    ├── confidence_delta < threshold? → ask clarifying question
    │
    ▼
scoring.service.ts         ← deterministic 100-pt scoring across full catalogue
    │
    ▼
Top 3 candidates
    │
    ▼
recommendation.service.ts  ← second LLM call generates per-car Expert Verdict
    │
    ▼
Ranked response + explanations → Zustand store → React UI re-render
```

**Primary LLM:** Google Gemini 1.5 Flash (intent extraction, expert verdicts)  
**Fallback LLM:** Llama 3.3 70B via Groq (automatic failover, zero UX interruption)  
**Database:** Supabase PostgreSQL + JSONB (preference vectors, car metadata, tag matching)  
**Hosting:** Vercel Serverless, Tokyo `hnd1` region (co-located with Supabase)

---

## 1. AI Layer: Dual-Model with Failover

A single `universalLLMCall()` function wraps both providers. If Gemini returns an error or malformed output, the request is transparently rerouted to Groq — no retry logic required in calling services.

```typescript
// llm.service.ts
async function universalLLMCall(prompt: string): Promise<string> {
  try {
    const res = await gemini.generateContent(prompt);
    return sanitizeJSON(res.text());          // strips markdown fences before JSON.parse
  } catch {
    // Primary failed → transparently reroute to Groq
    const fallback = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });
    return sanitizeJSON(fallback.choices[0].message.content ?? "");
  }
}
```

Both models are constrained via system prompt to return **raw JSON only**. `sanitizeJSON()` strips any residual ` ```json ` fences before parsing to prevent `JSON.parse` failures from otherwise-valid responses.

---

## 2. Intent Extraction (`intent.service.ts`)

The intent service maintains a persistent, typed representation of user preferences that evolves across conversation turns — not just keyword extraction.

### Preference Schema

```typescript
interface UserIntent {
  budget_max_lakh:  number   | null;  // hard constraint for scoring disqualifier
  body_types:       string[] | null;  // ["SUV", "Sedan", "Hatchback"]
  priority:         string   | null;  // "mileage" | "safety" | "performance"
  lifestyle_tags:   string[] | null;  // ["highway", "family", "adventure"]
  fuel_type:        string   | null;  // "petrol" | "diesel" | "electric"
  confidence_delta: number;           // 0–25 per turn; accumulates across session
}
```

### Key Design Decisions

**Confidence Delta System**  
Each LLM response returns a `confidence_delta` (0–25). This accumulates across turns, letting the system decide whether it has enough signal to push a recommendation or ask a clarifying question. A vague opener ("I need a car") returns a low delta; a message with budget, use-case, and fuel preference returns a high one.

**Normalization**  
The prompt maps ambiguous natural language to strict enum values before they reach the database. "I want a car with high ground clearance" → `body_types: ["SUV"]`. This keeps downstream SQL queries predictable and prevents partial matches from polluting the ranked results.

**Zero-Guessing Policy**  
The system prompt explicitly forbids the model from inferring values — unknown fields must return `null`. This prevents the scoring engine from disqualifying cars based on a hallucinated budget constraint, which was an early failure mode caught in testing.

---

## 3. Scoring & Ranking Engine

The engine runs in two sequential phases to balance speed with explainability.

### Phase 1 — Mathematical Scoring (`scoring.service.ts`)

Every vehicle starts at a 100-point base score, adjusted by deterministic rules:

| Signal | Type | Logic |
|---|---|---|
| `budget_max_lakh` | **Hard disqualifier** | Score → 0 immediately if `car.price > budget_max_lakh`. No partial credit. |
| Priority: `performance` | Soft weight (+0–20 pts) | `(car.power_bhp / 170) * 20` — ratio against 170 bhp segment-leading baseline |
| Priority: `mileage` | Soft weight (+0–20 pts) | Proportional to ARAI-certified kmpl rating within segment |
| Priority: `safety` | Soft weight (+0–20 pts) | Weighted by NCAP star rating |
| Seating mismatch | Soft penalty (−0–10 pts) | Applied when stated family size exceeds car's seating capacity |
| Tag overlap bonus | Soft weight (+0–15 pts) | Intersection of `lifestyle_tags` vs JSONB `car.tags` column in Postgres |

The hard budget disqualifier runs first. Cars that fail it are excluded from all further computation.

### Phase 2 — AI Reasoning (`recommendation.service.ts`)

Once the top three cars are mathematically ranked, a second LLM call generates a human-readable **Expert Verdict** for each. The prompt injects the user's full extracted intent alongside each car's spec sheet, so the explanation is grounded in the actual user profile rather than generic copy.

```typescript
// recommendation.service.ts (simplified)
const [dbResults, contextSummary] = await Promise.all([
  fetchTopCars(scoredIds),
  buildUserContextSummary(intent),
]);

const verdicts = await Promise.all(
  dbResults.map((car) =>
    universalLLMCall(buildVerdictPrompt(car, contextSummary))
  )
);
```

---

## 4. Serverless Optimizations

Deploying on Vercel's serverless runtime exposed several constraints that required manual fixes — standard AI-generated patterns consistently broke in this environment.

### Latency: Sequential → Parallel

Before refactoring, database fetches and AI calls were chained:

```
DB fetch (~800ms) → AI call (~1400ms) = ~2200ms p50
```

Refactoring independent operations into `Promise.all`:

```
DB fetch ┐
          ├── Promise.all → ~1100ms p50
AI call  ┘
```

**Measured improvement: ~3.2s → ~1.6s p50**

### Connection Pooling

Serverless functions spin up a fresh Node.js process per invocation, which exhausts a standard PostgreSQL connection pool rapidly under load. The `pg` client is configured with hard limits:

```typescript
// db.config.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Transaction Pooler, port 6543
  max: 3,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
});
```

Using Supabase's **Transaction Pooler** (port `6543`) rather than the direct connection string is required here — the direct connection bypasses pooling entirely and hits Postgres's connection cap under concurrent cold starts.

### Read-Only Filesystem (`EROFS`)

Vercel's runtime filesystem is read-only. Any `fs.writeFile` call — including file-based loggers — throws `EROFS: read-only file system`. The logging service was made environment-aware:

```typescript
// logger.ts
const transport =
  process.env.NODE_ENV === "production"
    ? new winston.transports.Console()
    : new winston.transports.File({ filename: "dev.log" });
```

---

## 5. Database Architecture

### Why PostgreSQL over SQLite

SQLite stores its state as a file on disk. In a serverless environment, each function invocation gets an isolated, ephemeral filesystem — data written by one invocation is invisible to the next. Migrating to Supabase (PostgreSQL) was necessary for persistence across invocations, not primarily a performance decision.

### JSONB for Preference Vectors and Tags

Car metadata and user preference vectors are stored as JSONB columns, enabling efficient subset queries directly in SQL:

```sql
-- Tag overlap query (simplified)
SELECT id, name,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements_text(tags) AS t
    WHERE t = ANY(:lifestyle_tags)
  ) AS tag_overlap_score
FROM cars
WHERE price_lakh <= :budget_max_lakh
ORDER BY tag_overlap_score DESC;
```

### Batch Seeding with `unnest`

The vehicle catalogue seed was refactored from single-row `INSERT` loops to `unnest`-based batch inserts, reducing seed time from several minutes to seconds for ~400 vehicles:

```sql
INSERT INTO cars (name, price_lakh, power_bhp, tags)
SELECT * FROM unnest(
  $1::text[], $2::numeric[], $3::numeric[], $4::jsonb[]
);
```

---

## 6. Frontend State & What-If Analysis

### Zustand Store

Global state is a single flat Zustand store holding the extracted intent, recommendation list, and conversation history:

```typescript
// store.ts
interface AppState {
  intent: UserIntent;
  recommendations: Car[];
  conversationHistory: Message[];
  updateIntent: (patch: Partial<UserIntent>) => void;
  fetchRecommendations: () => Promise<void>;
}
```

### What-If Analysis Flow

When a user types "What if I increase my budget to ₹20L?", it is processed as a normal conversation turn. `intent.service.ts` extracts the updated `budget_max_lakh`, patches the Zustand store, and immediately calls `fetchRecommendations()`. The car list re-ranks without a page reload because the entire pipeline is stateless — given the same intent object, the output is deterministic.

---

## Local Setup

**Prerequisites:** Node.js v18+, Supabase project, Gemini API key, Groq API key.

```bash
# 1. Clone and install
git clone https://github.com/koachgg/carDekho.git
cd carDekho/autopilot
npm run install:all

# 2. Configure environment
cp .env.example .env
```

```env
# Use Transaction Pooler URL (port 6543), not the direct connection string
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

```bash
# 3. Seed the database
npm run db:seed

# 4. Start dev servers
npm run dev
# Frontend → http://localhost:5173
# Backend  → http://localhost:3001
```

### Vercel Deployment Notes

- Set all three environment variables in Vercel project settings
- Deploy to **Tokyo (`hnd1`)** region to minimize latency to Supabase's `ap-southeast-1` instance
- `DATABASE_URL` must be the **Transaction Pooler** string — the direct connection exhausts Postgres connections under cold-start load

---

*MIT License · [github.com/koachgg/carDekho](https://github.com/koachgg/carDekho)*
