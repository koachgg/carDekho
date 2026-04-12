---

# Dev Log — CarDekho AutoPilot

---

## Build failing on Vercel

Read the log before touching AI. `mv client/dist ./dist` was the problem — Vite outputs to `dist`, Vercel was looking somewhere else. Told AI the exact error, asked for the `vercel.json` fix. One line change. Done.

---

## Deployed but crashing immediately

`EROFS: read-only file system` in the runtime logs. Knew straight away — Winston was trying to write a log file. Serverless FS is read-only. Asked AI to refactor the logger to use console transport in prod. Output was mostly right but it had left a `fs.mkdirSync` call in the init block. Removed that manually.

---

## Catalogue empty on every request

Not a bug — SQLite on Vercel writes to `/tmp` which is wiped between invocations. Knew this before asking AI anything. Decision was already made: move to Postgres. Used AI to compare Supabase vs PlanetScale vs Railway on free tier + connection pooling. Picked Supabase. AI doesn't make that call, I do.

---

## Migration script

Wrote the structure myself — table order, batch size, idempotency requirements. AI filled in the `pg` syntax. It generated single-row inserts in a loop. Rewrote to batch with `unnest`. Fewer round trips, faster seed.

---

## Config drift causing intermittent failures

`DATABASE_URL` and `SUPABASE_URL` were being used inconsistently across modules — classic copy-paste drift. Asked AI to grep all `process.env` references and produce a canonical list. It caught three I'd missed. Standardised on `DATABASE_URL` everywhere, updated Vercel env vars.

---

## Connection timeouts under load

Default `pg` pool was wrong for Supabase free tier limits. AI's first suggested config was too aggressive — 10 max connections would have hit the cap immediately. Tested with a diagnostic script, settled on `max: 3`, `idleTimeoutMillis: 10000`. Stable after that.

---

## Shortlist endpoint crashing

Stack trace pointed straight to JSON parsing. PostgreSQL returns `JSONB` as a parsed object via `pg` — code was calling `JSON.parse()` on it again. AI confirmed the read, wrote the safe parse wrapper. Two minute fix.

---

## Everything slow

Added `console.time` around the main callsites myself first. Two independent DB queries running sequentially — catalogue fetch and user history. Asked AI to refactor to `Promise.all`. It also caught a deferrable metadata fetch in the AI response handler I hadn't noticed. p50 dropped from ~3.2s to ~1.6s. Measured, not guessed.

---

## How I actually used AI

Gave it specific problems with specific context. Never pasted a file and said "fix this." When output was wrong I said why and what I wanted instead — didn't just retry. Wrote code myself when the logic required actual judgment. Every diff got reviewed before committing.

Biggest time saves: migration script boilerplate, the env var audit, parallelising queries. Biggest AI failure: the pool config — had to throw it out and derive the right values from Supabase's own docs.

---

## What's live

Deployed on Vercel. Persistent catalogue on Supabase. Conversational recommendation flow, shortlist management, works end to end. Built and shipped in the window given.

---
